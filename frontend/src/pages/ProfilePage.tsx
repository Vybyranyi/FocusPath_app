import AccountActions from "@components/profile/AccountActions";
import PasswordCard from "@components/profile/PasswordCard";
import ProfileAvatar from "@components/profile/ProfileAvatar";
import ProfileInfoCard from "@components/profile/ProfileInfoCard";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-base-bg pb-28 md:pb-12">
      <div className="container max-w-120 mx-auto pt-6 md:pt-10 flex flex-col gap-6">
        <ProfileAvatar />
        <ProfileInfoCard />
        <PasswordCard />
        <AccountActions />
      </div>
    </div>
  );
}
