import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/liveblocks.config";
import LiveCursors from "./cursor/LiveCursors";
import { useCallback, useEffect, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
  const [reaction, setReaction] = useState<Reaction[]>([]);

  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  //Broadcast event to other event in the room
  const broadcast = useBroadcastEvent();

  useInterval(() => {
    setReaction(r => r.filter((rr) => rr.timestamp > Date.now() - 4000 ))
  }, 1000)
  //Use Interval Hook
  useInterval(() => {
    if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor){
      setReaction((prevReaction) => reaction.concat(
        [
          {
            point: {x: cursor.x, y: cursor.y},
            value: cursorState.reaction,
            timestamp: Date.now(),

          }
        ]
      ))
      //Other users will see
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction
      })
    }
  },100);

  //This function show the user reactions
  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReaction((reactions) => reaction.concat(
      [
        {
          point: {x: event.x, y: event.y},
          value: event.value,
          timestamp: Date.now(),

        }
      ]
    ))
  })
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();
    if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      //update the cursor positoin
      updateMyPresence({ cursor: { x, y } });
    }
  }, []);

  const handlePointerLeave = useCallback((event: React.PointerEvent) => {
    // event.preventDefault();
    setCursorState({ mode: CursorMode.Hidden });
    // const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
    // const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

    //update the cursor positoin
    updateMyPresence({ cursor: null, message: null });
  }, []);
  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      setCursorState((state: CursorState) =>
        cursorState.mode == CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, setCursorState]
  );
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      // event.preventDefault();
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      //update the cursor positoin
      updateMyPresence({ cursor: { x, y } });

      //
      setCursorState((state: CursorState) =>
        cursorState.mode == CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [cursorState.mode, setCursorState]
  );

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
    //Remove the event listners
    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const setReactions = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);
  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="h-[100vh] w-full flex justify-center items-center text-center"
    >
      <h1 className="text-5xl text-white">Hello Startin Up</h1>
      {reaction.map((react) => (
        <FlyingReaction
          key={react.timestamp.toString()}
          x={react.point.x}
          y={react.point.y}
          timestamp={react.timestamp}
          value={react.value}
        />
      ))}
      {/* Check if cursor exist */}
      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence={updateMyPresence}
        />
      )}
      {cursorState.mode === CursorMode.ReactionSelector && (
        <ReactionSelector setReaction={setReactions} />
      )}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
