import { useEffect, useRef } from 'react';

interface PathData {
  rootY: number;
  fill: string;
  offsetX: number;
  root: Array<{ x: number; y: number }>;
}

export const GradientBackground = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!svgRef.current) return;

    // Original settings from CodePen - ONLY lightnessEndColor changes
    const settings = {
      amplitudeX: 100,
      amplitudeY: 20,
      lines: 20,
      hueStartColor: 12,
      saturationStartColor: 15,
      lightnessStartColor: 67,
      hueEndColor: 216,
      saturationEndColor: 50,
      lightnessEndColor: 7, // This is the ONLY value that changes (0-50 based on time)
      smoothness: 3,
      offsetX: 10,
      fill: true,
      crazyness: false
    };

    let winW = window.innerWidth;
    let winH = window.innerHeight;
    const overflow = Math.abs(settings.lines * settings.offsetX);

    // Calculate lightness based on time: 12pm = 50, 12am = 0
    const updateLightness = (): number => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const timeInHours = hour + minute / 60;

      let lightness: number;
      // From midnight (0) to noon (12): 0 -> 50
      if (timeInHours >= 0 && timeInHours < 12) {
        lightness = (timeInHours / 12) * 50;
      }
      // From noon (12) to midnight (24): 50 -> 0
      else {
        lightness = ((24 - timeInHours) / 12) * 50;
      }

      return Math.max(0, Math.min(50, lightness));
    };

    const hslToString = (h: number, s: number, l: number) =>
      `hsl(${h}, ${s}%, ${l}%)`;

    // Interpolate colors using the chroma-like gradient
    const interpolateColor = (
      start: number[],
      end: number[],
      steps: number
    ): string[] => {
      const colors: string[] = [];
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const h = start[0] + (end[0] - start[0]) * ratio;
        const s = start[1] + (end[1] - start[1]) * ratio;
        const l = start[2] + (end[2] - start[2]) * ratio;
        colors.push(hslToString(h, s, l));
      }
      return colors;
    };

    const createPath = (pathData: PathData): string => {
      const root = pathData.root;
      const parts: string[] = [];
      const winHeight = winH;
      const overflowVal = overflow;

      // First & second points
      parts.push(`M -${overflowVal} ${winHeight + overflowVal}`);
      parts.push(`L ${root[0].x} ${root[0].y}`);

      // Magic points (Bézier curves for smoothness)
      for (let i = 1; i < root.length - 1; i++) {
        const prevPoint = root[i - 1];
        const actualPoint = root[i];
        const diffX = (actualPoint.x - prevPoint.x) / settings.smoothness;
        const x1 = prevPoint.x + diffX;
        const x2 = actualPoint.x - diffX;
        const x = actualPoint.x;
        const y1 = prevPoint.y;
        const y2 = actualPoint.y;
        const y = actualPoint.y;

        parts.push(`C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`);
      }

      // Second last
      const reverseRoot = [...root].reverse();
      parts.push(`L ${reverseRoot[0].x} ${reverseRoot[0].y}`);

      // Last point
      parts.push(`L ${winW + overflowVal} ${winHeight + overflowVal}`);

      // Close path
      parts.push(`Z`);

      return parts.join(' ');
    };

    const init = () => {
      if (!svgRef.current) return;

      svgRef.current.innerHTML = '';
      winW = window.innerWidth;
      winH = window.innerHeight;

      // ONLY update lightnessEndColor based on current time
      settings.lightnessEndColor = updateLightness();

      const startColor = [
        settings.hueStartColor,
        settings.saturationStartColor,
        settings.lightnessStartColor
      ];
      const endColor = [
        settings.hueEndColor,
        settings.saturationEndColor,
        settings.lightnessEndColor // This is the ONLY dynamic value
      ];
      const colors = interpolateColor(startColor, endColor, settings.lines + 1);

      // Background
      if (settings.fill) {
        svgRef.current.style.backgroundColor = colors[0];
      } else {
        svgRef.current.style.backgroundColor = '#000';
      }

      // Lines
      const paths: PathData[] = [];
      for (let i = 0; i < settings.lines + 1; i++) {
        const rootY = Math.floor(winH / settings.lines * i);
        const offsetX = settings.offsetX * i;
        const root: Array<{ x: number; y: number }> = [];

        let x = -overflow + offsetX;
        let upSideDown = false;
        root.push({ x, y: rootY });

        while (x < winW) {
          let value: number;
          let y: number;

          // Crazyness
          if (settings.crazyness) {
            value = Math.random() > 0.5 ? 1 : -1;
            x += Math.floor((Math.random() * settings.amplitudeX / 2) + (settings.amplitudeX / 2));
            y = (Math.floor((Math.random() * settings.amplitudeY / 2) + (settings.amplitudeY / 2)) * value) + rootY;
          } else {
            // Geometric
            upSideDown = !upSideDown;
            value = upSideDown ? -1 : 1;
            x += settings.amplitudeX;
            y = settings.amplitudeY * value + rootY;
          }

          root.push({ x, y });
        }

        root.push({ x: winW + overflow, y: rootY });

        paths.push({ rootY, fill: colors[i + 1], offsetX, root });
      }

      // Render paths
      paths.forEach(pathData => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', pathData.fill);
        path.setAttribute('stroke', pathData.fill);
        path.setAttribute("d", createPath(pathData));
        svgRef.current?.appendChild(path);
      });

      // Set SVG class based on fill setting
      if (settings.fill) {
        svgRef.current.setAttribute('class', 'path');
      } else {
        svgRef.current.setAttribute('class', 'stroke');
      }
    };

    init();

    // Handle window resize
    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    // Update every minute to gradually change lightness
    const updateAnimation = () => {
      init();
      timerRef.current = window.setTimeout(updateAnimation, 60000);
    };
    timerRef.current = window.setTimeout(updateAnimation, 60000);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      id="gradient-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1
      }}
    />
  );
};
