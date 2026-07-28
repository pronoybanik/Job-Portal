
export type UpdateAuthProfilePayload = {
  userId: string;
  name?: string;
  phoneNumber?: string;
  bio?: string | null;
  resume?: string | null;
  resumePublicId?: string | null;
  profilePic?: string | null;
  profilePicPublicId?: string | null;
  subscription?: string | Date | null;
  userSkills?: string[];
};

