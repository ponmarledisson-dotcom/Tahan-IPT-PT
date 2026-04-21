export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gray-10 shadow-md">
      <h1 className="font-sans pl-12 text-2xl font-bold text-[#3b2314]">
        TAHAN
      </h1>
      <div className="flex gap-3">
        <button className="px-5 py-2 border-2 border-gray-800 rounded-lg text-[#3b2314] hover:bg-gray-100">
          Log In
        </button>
      </div>
    </nav>
  );
}
