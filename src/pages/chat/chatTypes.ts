
  export type UserRole = "admin" | "gold" | "free";
  export type RoomType = "classic" | "gold";

  export interface ChatRoom {
    id: string;
    name: string;
    type: RoomType;
    isPrivate: boolean;
    description?: string;
    createdBy?: string;
    unreadCount?: number;
  }

  export interface ChatMessage {
    id: string;
    roomId: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    content?: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
    audioUrl?: string;
    replyToId?: string;
    replyToContent?: string;
    replyToUsername?: string;
    editedAt?: string;
    deletedForAll?: boolean;
    ephemeral?: boolean;
    createdAt: string;
    status?: "sending" | "sent" | "error";
  }

  export interface ChatReaction {
    id?: string;
    messageId: string;
    userId: string;
    emoji: string;
  }

  export interface ChatPin {
    id?: string;
    roomId: string;
    messageId: string;
    pinnedBy: string;
  }

  export interface TypingUser {
    userId: string;
    username: string;
  }

  export interface ConnectedUser {
    userId: string;
    username: string;
    avatarUrl?: string;
  }

  export interface GlobalChatRoomProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
  }

  export const RECEIVER = import.meta.env.VITE_PAYMENT_RECEIVER || "";
  export const EMOJI_LIST = ["❤️", "🔥", "😂", "😮", "👍", "🎉", "💯", "🤯", "💀", "🫡"];
  export const DEFAULT_ROOM_NAME = "General";
  export const MESSAGES_PER_PAGE = 60;
  export const FILE_MAX_SIZE = 10 * 1024 * 1024;
  export const FILE_ACCEPT = [
    "image/png","image/jpeg","image/jpg","image/gif","image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip","application/x-zip-compressed","application/x-rar-compressed",
  ].join(",");
  