import { updateProfile } from "@store/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useRef, useState } from "react";

export default function ProfileAvatar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      await dispatch(
        updateProfile({
          name: user.name,
          surname: user.surname,
          birthday: user.birthday,
          gender: user.gender,
          email: user.email,
          avatar: reader.result as string,
        }),
      );
      setAvatarLoading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        aria-label={user.avatar ? "Change profile photo" : "Add a profile photo"}
        className="relative w-24 h-24 rounded-full cursor-pointer group"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="w-full h-full rounded-full bg-blue-gradient flex items-center justify-center">
            <span className="text-on-brand text-2xl font-bold" aria-hidden>
              {initials}
            </span>
          </span>
        )}

        <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex items-center justify-center">
          <svg
            fill="none"
            stroke="white"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </span>

        {avatarLoading && (
          <span className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin-app" />
          </span>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="text-center">
        <h2 className="display-6">
          {user.name} {user.surname}
        </h2>
        <p className="body-light text-ink-2 mt-0.5">{user.email}</p>
      </div>
    </div>
  );
}
