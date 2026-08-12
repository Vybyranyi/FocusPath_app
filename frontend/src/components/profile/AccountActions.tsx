import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import { deleteAccount, logoutUser } from "@store/authSlice";
import { useAppDispatch, useAppSelector } from "@store/hooks";
import { useState } from "react";
import { useToast } from "@hooks/useToast";
import { useNavigate } from "react-router";

export default function AccountActions() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.auth);
  const { notify } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [problem, setProblem] = useState("");

  const handleLogout = async () => {
    // Only the server can clear an httpOnly cookie, so signing out is a request.
    await dispatch(logoutUser());
    notify("Signed out");
    navigate("/login");
  };

  const handleDelete = async () => {
    setProblem("");
    const result = await dispatch(deleteAccount({ password }));

    if (deleteAccount.rejected.match(result)) {
      setProblem((result.payload as string) ?? "Could not delete the account");
      return;
    }

    navigate("/login");
  };

  const cancel = () => {
    setShowConfirm(false);
    setPassword("");
    setProblem("");
  };

  return (
    <div className="flex flex-col gap-3">
      <Button type="outline" size="large" onClick={handleLogout}>
        Log Out
      </Button>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="w-full py-4 rounded-3xl ring-card flex items-center justify-center hover:bg-danger-soft transition-colors"
        >
          <span className="body-bold text-danger">Delete Account</span>
        </button>
      ) : (
        <div className="bg-surface rounded-2xl shadow-medium p-5 flex flex-col gap-4">
          <p className="body-bold text-center">
            Are you sure you want to delete your account? This action cannot be
            undone.
          </p>

          {/* Proving the password matters here: a stolen session should not be
              able to destroy an account on its own. */}
          <Input
            label="Confirm your password"
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={problem}
          />

          <div className="flex gap-3">
            <Button type="outline" size="medium" onClick={cancel}>
              Cancel
            </Button>
            <button
              onClick={handleDelete}
              disabled={loading || password.length === 0}
              className="flex-1 py-3 rounded-[22px] bg-danger hover:bg-danger/80 disabled:opacity-50 transition-colors"
            >
              <span className="body-bold text-on-accent">
                {loading ? "Deleting..." : "Yes, delete"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
