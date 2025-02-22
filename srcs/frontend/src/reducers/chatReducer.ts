export const chatReducer = (state: any, action: any) => {
  switch (action.type) {
    case "SET_FRIENDS":
      return {
        ...state,
        newFriends: action.data,
      };
    case "ADD_FRIEND":
      return {
        ...state,
        newFriends: state.newFriends.some((friend: { id: any; }) => friend.id === action.data.id)
            ? state.newFriends
            : [...state.newFriends, action.data]
      };
    case "REMOVE_FRIEND":
      return {
        ...state,
        newFriends: state.newFriends.filter(
          (friend: any) => friend.id != action.data
        ),
      };

    case "SET_GROUPS":
      return {
        ...state,
        newGroups: action.data,
      };
    case "ADD_GROUP":
      return {
        ...state,
        newGroups: state.newGroups.some((group: { id: any; }) => group.id === action.data.id)
            ? state.newGroups
            : [...state.newGroups, action.data]
      };

    // case "CHANGE_GROUP":
    //   state.newGroups = state.newGroups.filter( (group: any) => group.id != action.data)
    //   return {
    //     ...state,
    //     newGroups: [...state.newGroups, action.data],
    //   };

    case "REMOVE_GROUP":
      return {
        ...state,
        newGroups: state.newGroups.filter(
          (group: any) => group.id != action.data
        ),
      };

    case "SET_USERS":
      return {
        ...state,
        users: action.data.data,
        usersMeta: action.data.meta,
      };
    case "ADD_USER":
      return {
        ...state,
        users: state.users.some((u: any) => u.user_id === action.data.user_id)
            ? state.users
            : [...state.users, action.data]
      };
    case "REMOVE_USER":
      return {
        ...state,
        users: state.users.filter((user: any) => user.id !== action.data),
      };

    case "SET_MEMBERS":
      return {
        ...state,
        newMembers: action.data,
      };
    case "ADD_MEMBER":
      return {
        ...state,
        newMembers: state.newMembers.some((member: { id: any; }) => member.id === action.data.id)
            ? state.newMembers
            : [...state.newMembers, action.data]
      };
    case "REMOVE_MEMBER":
      return {
        ...state,
        newMembers: state.newMembers.filter(
          (member: any) => member.id !== action.data
        ),
      };

    case "SET_ALL_GROUPS":
      return {
        ...state,
        allGroups: action.data,
      };
    case "ADD_ALL_GROUPS":
      return {
        ...state,
        allGroups: state.allGroups.some((group: { id: any; }) => group.id === action.data.id)
            ? state.allGroups
            : [...state.allGroups, action.data],
      };
    case "REMOVE_ALL_GROUPS":
      return {
        ...state,
        allGroups: state.allGroups.filter(
          (group: any) => group.id !== action.data
        ),
      };

    case "SET_MESSAGES":
      return {
        ...state,
        messages: action.data,
      };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.data],
      };

    case "ROOM":
      return {
        ...state,
        roomDm: action.data,
      };

    default:
      return state;
  }
};
