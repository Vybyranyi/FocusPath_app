export default function AppLoading() {
  return (
    <div className="flex items-center justify-center h-screen bg-base-bg">
      <div className="flex flex-col items-center gap-4">
        <span
          className="w-10 h-10 rounded-full border-4 border-primary-black-10 border-t-primary-blue animate-spin-app"
          aria-label="Loading"
        />
        <p className="body-light">Loading...</p>
      </div>
    </div>
  );
}
