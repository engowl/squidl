import { useRouteError, Link } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm p-6 text-center">
        <h1 className="text-xl font-bold mb-2">Oops!</h1>
        <p className="mb-2">Sorry, an unexpected error has occurred.</p>
        <p className="mb-2">
          <i>{error.statusText || error.message}</i>
        </p>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
};

export default ErrorPage;
