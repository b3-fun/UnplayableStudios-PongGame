import {HttpException, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
//import { Account } from './entity/account.entity';
import {PrismaService} from 'src/prisma/prisma.service';
import {adjectives, animals, colors, uniqueNamesGenerator} from 'unique-names-generator';

const speakeasy = require('speakeasy');

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService, private prisma: PrismaService) {} //Inject

	FortyTwoLogin(req) {
		if (!req.user) {
			return 'No user from  FortyTwo';
		}

		return {
			message: 'User information from  FortyTwo',
			user: req.user,
		};
	}

	async createAccount(id: string, avatar: string, token: string) {
		try 
		{
			const found = await this.prisma.user.findUnique({
				where: {
					user_login: id,
				},
			});
				
			if (!found) 
			{
				const shortName = uniqueNamesGenerator({
					dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
					length: 1
				  });
				const User = await this.prisma.user.create({
					data: {
						user_login: id,
						user_name: shortName,
						user_avatar: avatar,
						two_authentication: token,
					},
				});				
				return User;
			}
			else
			{
				return await this.prisma.user.update({
					where: {
						user_login: id,
					},
					data: {
						// Add fields to update
						two_authentication: token,
					}
				});
			}
		} 
		catch (err: any) 
		{
			throw new HttpException("Prisma Error Creating account", 502)
		}
	}

	
async generate2fa(id:string) 
{
	const getUser  = await this.prisma.user.findUnique({
		where: {
		  user_login: id,
		},
	  })
      
	var {two_authentication } = getUser;
	
	if (two_authentication === null)
	{
		var secret = speakeasy.generateSecret({
			 name: 'ponGame',
			 length: 10
			});
		const update = await this.prisma.user.update({
			where: {
			  user_login: id,
			},
			data: {
				two_authentication: secret.base32,
			},
		  })
		  two_authentication = secret.base32;
	}
		return (two_authentication);
}


async verify2fa(userToken : string, base32secret : string)
{
	var verified = speakeasy.totp.verify({ secret: base32secret,
		encoding: 'base32',
		token: userToken });
		return verified;
	}
async deleteTwoFa(user_id : string)
{
    try
    {

        var deleted = this.prisma.user.update(
            {
                where:
                {
                    user_login: user_id,
                },
                data :{
                    two_authentication: null,
                }
            }
            ) 
            return deleted
        }
        catch(err)
        {
            throw new HttpException("ERROR", 404)
        }
	}


	async findUserId(login: string) {
		return await this.prisma.user.findUnique({ where: { user_login: String(login) } });
	}

	signToken(userLogin: string, userId : Number, twofa : boolean, enable : boolean) {
		const payload = {
			userLogin: userLogin,
			userId: userId,
			isAuth: twofa,
            isEnabled: enable
		};

		const accessToken = this.jwtService.sign(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: '1w',
		});

		return {
			access_token: accessToken,
		};
	}
	verifyToken(accessToken: string) //https://www.npmjs.com/package/jsonwebtoken
	{
		try 
		{
			const payload = this.jwtService.verify(accessToken, {
				secret: process.env.JWT_SECRET
			})
			return (payload);
		}
		catch (err)
		{
			return null;
		}
	}

	decodeB3Token(token: string): {
		id: string;
		address: string;
		username?: string;
		avatar?: string;
	} {
		const base64Payload = token.split('.')[1];
		const payload = Buffer.from(base64Payload, 'base64').toString();
		return JSON.parse(payload);
	}

	formatAddress(address: string): string {
		if (!address) return '';
		const first4 = address.slice(0, 6);  // Include "0x" prefix
		const last4 = address.slice(-4);
		return `${first4}...${last4}`;
	}

}
