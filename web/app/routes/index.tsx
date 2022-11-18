export default function Index() {
  return (
    <div className="h-screen flex flex-col justify-end">
      <div className="bg-blue-500 flex-grow overflow-y-auto">
        {(() => {
          return Array(90).fill(undefined).map((_, i) => {
            return (
              <div className="h-[100px] bg-rose-300" key={i}> THe number is {i}</div>
            );
          });
        })()}
      </div>
      <div className="h-10 bg-red-500 "></div>
    </div>
  );
}
