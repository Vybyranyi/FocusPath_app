import { Link, useNavigate } from "react-router";
import Button from "@components/ui/Button";

/**
 * What a signed-out visitor gets instead of the navigation bar.
 *
 * The bar itself would be useless to them: every destination in it sits behind
 * `ProtectedRoute`, so each tap would bounce them to the sign-in screen. The
 * library is the one part of this app a stranger can walk into, and the only
 * two things worth offering there are a way in and a way to join.
 */
export default function GuestBar() {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-line bg-surface">
      <div className="page-gutter max-w-6xl mx-auto h-16 flex items-center justify-between gap-4">
        <Link to="/explore" className="display-6 text-ink">
          FocusPath
        </Link>

        {/* Fixed widths rather than `w-fit`: Button has no horizontal padding
            of its own — everywhere else in this app it fills its column — so
            shrinking it to its text leaves the label against both edges. */}
        <div className="flex items-center gap-2">
          <div className="w-24">
            <Button type="outline" size="small" onClick={() => navigate("/login")}>
              Log in
            </Button>
          </div>
          <div className="w-24">
            <Button type="primary" size="small" onClick={() => navigate("/register")}>
              Sign up
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
