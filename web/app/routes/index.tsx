import { Link } from "@remix-run/react";
import { ChevronLeft } from "~/components/icons/chevronLeft";

export default function Index() {
  const disabled = true;

  return (
    <div className="h-screen grid place-items-center ">
      <Link className="group border-2 px-3 py-2 rounded-md flex items-center gap-x-2 border-black hover:border-blue-600" to="/previous">
        <ChevronLeft  className="w-4 h-4 group-hover:text-blue-600 " />
        <span className="group-hover:text-blue-600">Previous Page</span>
      </Link>
    </div>
  );
}
