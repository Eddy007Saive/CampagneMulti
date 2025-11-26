const Tooltips = ({ children, content }) => (
  <div className="group relative inline-block">
    {children}
    <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg -translate-x-1/2 left-1/2">
      {content}
    </div>
  </div>
);

export default Tooltips;