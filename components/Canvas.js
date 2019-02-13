import React, { useEffect, useRef, useState } from "react";

const CANVAS_SIZE = 400;
const BLOCK_SIZE = 20;
const SHIP_SIZE = 20;
const BULLET_SIZE = 10;
const ENEMY_SIZE = 16;
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

  const [isPaused, setIsPaused] = useState(true);
  const mouse = useMousePosition(canvasRef);

  const [shipCoordinate, setShipCoordinate] = useState(OUT_OF_MAP);
  useEffect(
    () => {
      if (!isPaused) {
        const x = Math.floor(mouse.x / CANVAS_DIMENSION);
        const y = Math.floor(mouse.y / CANVAS_DIMENSION);
        setShipCoordinate({ x, y });
      }
    },
    [isPaused, mouse]
  );

  const [bulletCoordinate, setBulletCoordinate] = useState(OUT_OF_MAP);
  const [isShooting, setIsShooting] = useState(false);
  const shootBullet = () => {
    if (isShooting) return;
    setBulletCoordinate({ x: shipCoordinate.x, y: shipCoordinate.y - 1 });
    setIsShooting(true);
  };
  useInterval(
    () => {
      if (bulletCoordinate.y === 0) {
        setBulletCoordinate(OUT_OF_MAP);
        setIsShooting(false);
      } else {
        setBulletCoordinate(prev => ({
          x: prev.x,
          y: prev.y - 1
        }));
      }
    },
    !isPaused && isShooting ? 100 : null
  );

  const [enemyCoordinate, setEnemyCoordinate] = useState(OUT_OF_MAP);
  const [isEnemyAlive, setIsEnemyAlive] = useState(false);
  useInterval(
    () => {
      setEnemyCoordinate({
        x: Math.floor(Math.random() * CANVAS_DIMENSION),
        y: 0
      });
      setIsEnemyAlive(true);
    },
    !isPaused ? 2200 : null
  );
  useInterval(
    () => {
      if (enemyCoordinate.y === CANVAS_DIMENSION) {
        setEnemyCoordinate(OUT_OF_MAP);
        setIsEnemyAlive(false);
        setScore(prev => prev - 200);
      } else {
        setEnemyCoordinate(prev => ({
          x: prev.x,
          y: prev.y + 1
        }));
      }
    },
    !isPaused && isEnemyAlive ? 100 : null
  );

  const [score, setScore] = useState(0);
  useEffect(
    () => {
      if (
        shipCoordinate.x === enemyCoordinate.x &&
        shipCoordinate.y === enemyCoordinate.y &&
        shipCoordinate !== OUT_OF_MAP
      ) {
        setScore(prev => prev - 1000);
        setEnemyCoordinate(OUT_OF_MAP);
        setIsEnemyAlive(false);
      }

      if (
        bulletCoordinate.x === enemyCoordinate.x &&
        bulletCoordinate.y === enemyCoordinate.y &&
        bulletCoordinate !== OUT_OF_MAP
      ) {
        setScore(prev => prev + 100);
        setBulletCoordinate(OUT_OF_MAP);
        setIsShooting(false);
        setEnemyCoordinate(OUT_OF_MAP);
        setIsEnemyAlive(false);
      }
    },
    [bulletCoordinate, enemyCoordinate]
  );

  const drawCanvas = () => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawShip(ctx);
    drawBullet(ctx);
    drawEnemy(ctx);
  };
  useAnimationFrame(drawCanvas);

  const drawShip = ctx => {
    ctx.fillStyle = "#00f";
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

  const drawEnemy = ctx => {
    ctx.fillStyle = "#f00";
    ctx.fillRect(
      BLOCK_SIZE * enemyCoordinate.x + (BLOCK_SIZE - ENEMY_SIZE) / 2,
      BLOCK_SIZE * enemyCoordinate.y + (BLOCK_SIZE - ENEMY_SIZE) / 2,
      ENEMY_SIZE,
      ENEMY_SIZE
    );
  };

  return (
    <main>
      <p>
        Hook Invaders
        <br />
        <a href="https://github.com/sthobis/hook-invaders">source</a>
      </p>
      <div
        className="container"
        onMouseEnter={() => setIsPaused(false)}
        onMouseLeave={() => setIsPaused(true)}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          onClick={shootBullet}
        />
        {isPaused && (
          <div className="pause-overlay">
            <p>paused</p>
          </div>
        )}
      </div>
      <p>score: {score}</p>
      <style jsx>{`
        main {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100vw;
          height: 100vh;
        }

        p {
          font-family: monospace;
          font-size: 14px;
          text-align: center;
        }

        .container {
          display: inline-block;
          position: relative;
        }

        canvas {
          background: #000;
        }

        canvas:hover {
          cursor: none;
        }

        .pause-overlay {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          justify-content: center;
          align-items: center;
          color: #fff;
        }
      `}</style>
      <style jsx global>{`
        body {
          margin: 0;
          box-sizing: border-box;
        }
      `}</style>
    </main>
  );
};

export default Canvas;
