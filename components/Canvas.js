import React, { useEffect, useRef, useState } from "react";

const CANVAS_SIZE = 400;
const BLOCK_SIZE = 20;
const SHIP_SIZE = 20;
const BULLET_SIZE = 10;
const CANVAS_DIMENSION = CANVAS_SIZE / BLOCK_SIZE;
const OUT_OF_MAP = { x: -1, y: -1 };

const useMousePosition = ref => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMouseRelativeToRef = e => {
      setMouse({
        x: e.clientX - ref.current.getBoundingClientRect().left,
        y: e.clientY - ref.current.getBoundingClientRect().top
      });
    };

    ref.current.addEventListener("mousemove", updateMouseRelativeToRef);
    return () => {
      canvasRef.current.removeEventListener(
        "mousemove",
        updateMouseRelativeToRef
      );
    };
  }, []);

  return mouse;
};

const useAnimationFrame = callback => {
  const callbackRef = useRef();
  useEffect(
    () => {
      callbackRef.current = callback;
    },
    [callback]
  );

  const animationFrameRef = useRef();
  useEffect(() => {
    animationFrameRef.current = window.requestAnimationFrame(loop);
    return () => {
      window.cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const loop = () => {
    callbackRef.current();
    animationFrameRef.current = window.requestAnimationFrame(loop);
  };

  return animationFrameRef;
};

const useInterval = (callback, delay) => {
  const callbackRef = useRef(callback);

  useEffect(
    () => {
      callbackRef.current = callback;
    },
    [callback]
  );

  const intervalId = useRef(callback);
  useEffect(
    () => {
      if (delay !== null) {
        intervalId.current = window.setInterval(() => {
          callbackRef.current();
        }, delay);
        return () => window.clearInterval(intervalId.current);
      }
    },
    [delay]
  );

  return () => window.clearInterval(intervalId.current);
};

const Canvas = () => {
  const canvasRef = useRef();

  const mouse = useMousePosition(canvasRef);

  const [shipCoordinate, setShipCoordinate] = useState({ x: 0, y: 0 });
  useEffect(
    () => {
      const x = Math.floor(mouse.x / CANVAS_DIMENSION);
      const y = Math.floor(mouse.y / CANVAS_DIMENSION);
      setShipCoordinate({ x, y });
    },
    [mouse]
  );

  const [bulletCoordinate, setBulletCoordinate] = useState(OUT_OF_MAP);
  const [isShooting, setIsShooting] = useState(false);
  const shootBullet = () => {
    if (isShooting) return;
    setBulletCoordinate({ x: shipCoordinate.x, y: shipCoordinate.y - 1 });
    setIsShooting(true);
  };
  const stopBulletInterval = useInterval(
    () => {
      if (bulletCoordinate.y === 0) {
        stopBulletInterval();
        setBulletCoordinate(OUT_OF_MAP);
        setIsShooting(false);
      } else {
        setBulletCoordinate(prev => {
          return {
            x: prev.x,
            y: prev.y - 1
          };
        });
      }
    },
    isShooting ? 100 : null
  );

  const drawCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawShip(ctx);
    drawBullet(ctx);
  };
  useAnimationFrame(drawCanvas);

  const drawShip = ctx => {
    ctx.fillStyle = "#ccc";
    ctx.fillRect(
      BLOCK_SIZE * shipCoordinate.x + (BLOCK_SIZE - SHIP_SIZE) / 2,
      BLOCK_SIZE * shipCoordinate.y + (BLOCK_SIZE - SHIP_SIZE) / 2,
      SHIP_SIZE,
      SHIP_SIZE
    );
  };

  const drawBullet = ctx => {
    ctx.fillStyle = "#ccc";
    ctx.fillRect(
      BLOCK_SIZE * bulletCoordinate.x + (BLOCK_SIZE - BULLET_SIZE) / 2,
      BLOCK_SIZE * bulletCoordinate.y + (BLOCK_SIZE - BULLET_SIZE) / 2,
      BULLET_SIZE,
      BULLET_SIZE
    );
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={shootBullet}
      />
      <style jsx>{`
        .canvas-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100vw;
          height: 100vh;
        }

        canvas {
          background: #000;
        }
      `}</style>
      <style jsx global>{`
        body {
          margin: 0;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default Canvas;
