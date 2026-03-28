import Button from "@components/ui/Button";
import { deleteAccount, logout } from "@store/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function AccountActions() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleDelete = async () => {
    await dispatch(deleteAccount());
    navigate("/login");
  };

  return (
    <div className="flex flex-col gap-3">
      <Button type="outline" size="large" onClick={handleLogout}>
        Log Out
      </Button>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 rounded-3xl ring-card flex items-center justify-center hover:bg-error-20 transition-colors"
        >
          <span className="body-bold text-error">Delete Account</span>
        </button>
      ) : (
        <div className="bg-base-white rounded-2xl shadow-medium p-5 flex flex-col gap-4">
          <p className="body-bold text-center">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <Button
              type="outline"
              size="medium"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 py-3 rounded-[22px] bg-error hover:bg-error/80 disabled:opacity-50 transition-colors"
            >
              <span className="body-bold text-base-white">
                {loading ? "Deleting..." : "Yes, delete"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
