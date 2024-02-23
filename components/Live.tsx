import { useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode } from "@/types/type";

const Live = () => {
  

  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const[cursorState, setCursorState] = useState({
    mode: CursorMode.Hidden,
  })
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    //update the cursor positoin
    updateMyPresence({ cursor: { x, y } });
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    // event.preventDefault();
     setCursorState({mode: CursorMode.Hidden})
    // const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    // const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    //update the cursor positoin
    updateMyPresence({ cursor: null, message: null });
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent) => {
    // event.preventDefault();
    const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    //update the cursor positoin
    updateMyPresence({ cursor: { x, y } });
  }, []);
  

//   Use Effect
useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
        if (e.key === "/") {
          setCursorState({
            mode: CursorMode.Chat,
            previousMessage: null,
            message: "",
          });
        } else if (e.key === "Escape") {
          updateMyPresence({ message: "" });
          setCursorState({ mode: CursorMode.Hidden });
        } else if (e.key === "e") {
          setCursorState({ mode: CursorMode.ReactionSelector });
        }
      };
  
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "/") {
          e.preventDefault();
        }
      };
  
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("keydown", onKeyDown);
  
      return () => {
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("keydown", onKeyDown);
      };
    }, [updateMyPresence]);

    
  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      className="h-[100vh] w-full flex justify-center items-center text-center"
    >
      <h1 className="text-5xl text-white">Hello Startin Up</h1>
      {/* Check if cursor exist */}
      {cursor && <CursorChat 
        cursor={cursor}
        cursorState={cursorState}
        setCursorState={setCursorState}
        updateMyPresence={updateMyPresence}
      />}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
