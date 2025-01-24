import { useEffect, useRef, useState } from "react";
import { generateWheelData, IWheelSegment } from "@/utils/wheel";

const WHEEL_RADIUS = 200;
const CENTER = WHEEL_RADIUS + 20;
const SEGMENT_ANGLE = (2 * Math.PI) / 37;
const BALL_RADIUS = 5;

export default function RouletteWheel() {
	const [rotation, setRotation] = useState(0);
	const [spinning, setSpinning] = useState(false);
	const [ballPosition, setBallPosition] = useState({ x: 0, y: -190 });
	const wheelData = generateWheelData();
	const animationRef = useRef<number>();

	const spinWheel = () => {
		if (spinning) return;
		setSpinning(true);
		const spinAngle = 360 * 5 + Math.random() * 360;
		setRotation((prevRotation) => prevRotation + spinAngle);
		animateBall();
		setTimeout(() => setSpinning(false), 5000);
	};

	const animateBall = () => {
		let start: number | null = null;
		const totalDuration = 5000;

		const animate = (timestamp: number) => {
			if (!start) start = timestamp;
			const elapsed = timestamp - start;
			const progress = Math.min(elapsed / totalDuration, 1);

			const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
			const easedProgress = easeOut(progress);

			const angle = (1 - easedProgress) * Math.PI * 20;
			const x = Math.cos(angle) * (WHEEL_RADIUS - 10);
			const y = Math.sin(angle) * (WHEEL_RADIUS - 10);

			setBallPosition({ x, y });

			if (progress < 1) {
				animationRef.current = requestAnimationFrame(animate);
			}
		};

		animationRef.current = requestAnimationFrame(animate);
	};

	useEffect(() => {
		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, []);

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100">
			<svg width={CENTER * 2} height={CENTER * 2} className="mb-4">
				<g transform={`translate(${CENTER}, ${CENTER})`}>
					<circle r={WHEEL_RADIUS} fill="brown" />
					{wheelData.map((segment, index) => (
						<WheelSegment
							key={segment.number}
							segment={segment}
							index={index}
						/>
					))}
					<circle r={WHEEL_RADIUS - 30} fill="brown" />
					<g
						transform={`rotate(${rotation})`}
						style={{
							transition: "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)",
						}}
					>
						<circle
							cx={ballPosition.x}
							cy={ballPosition.y}
							r={BALL_RADIUS}
							fill="white"
						/>
					</g>
				</g>
				<g transform={`translate(${CENTER}, ${CENTER})`}>
					<polygon points="0,-10 10,0 0,10 -10,0" fill="white" />
				</g>
			</svg>
			<button onClick={spinWheel} disabled={spinning}>
				{spinning ? "Spinning..." : "Spin the Wheel"}
			</button>
		</div>
	);
}

function WheelSegment({
	segment,
	index,
}: {
	segment: IWheelSegment;
	index: number;
}) {
	const angle = index * SEGMENT_ANGLE;
	const largeArcFlag = SEGMENT_ANGLE > Math.PI ? 1 : 0;
	const startX = Math.cos(angle) * WHEEL_RADIUS;
	const startY = Math.sin(angle) * WHEEL_RADIUS;
	const endX = Math.cos(angle + SEGMENT_ANGLE) * WHEEL_RADIUS;
	const endY = Math.sin(angle + SEGMENT_ANGLE) * WHEEL_RADIUS;

	const pathData = [
		`M 0 0`,
		`L ${startX} ${startY}`,
		`A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
		"Z",
	].join(" ");

	const textAngle = angle + SEGMENT_ANGLE / 2;
	const textRadius = WHEEL_RADIUS - 20;
	const textX = Math.cos(textAngle) * textRadius;
	const textY = Math.sin(textAngle) * textRadius;

	return (
		<g>
			<path d={pathData} fill={segment.color} stroke="white" strokeWidth="1" />
			<text
				x={textX}
				y={textY}
				fill="white"
				fontSize="12"
				fontWeight="bold"
				textAnchor="middle"
				dominantBaseline="middle"
				transform={`rotate(${
					(textAngle * 180) / Math.PI + 90
				}, ${textX}, ${textY})`}
			>
				{segment.number}
			</text>
		</g>
	);
}
