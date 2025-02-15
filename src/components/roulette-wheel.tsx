import { useEffect, useRef, useState } from "react";
import { generateWheelData, IWheelSegment } from "@/utils/wheel";

const OUTER_WALL_WIDTH = 20;
const WHEEL_RADIUS = 150;
const CENTER = WHEEL_RADIUS + 20;
const SEGMENT_ANGLE = (2 * Math.PI) / 37;
const BALL_RADIUS = 5;

export default function RouletteWheel() {
	const [spinning, setSpinning] = useState(false);
	const [ballPosition, setBallPosition] = useState({
		x: 0,
		y: -(WHEEL_RADIUS + OUTER_WALL_WIDTH / 2),
	});
	const wheelData = generateWheelData();
	const animationRef = useRef<number>();

	const spinWheel = () => {
		if (spinning) return;
		setBallPosition({
			x: 0,
			y: -(WHEEL_RADIUS + OUTER_WALL_WIDTH / 2),
		});
		setSpinning(true);
		animateBall();
		setTimeout(() => setSpinning(false), 5000);
	};

	const animateBall = () => {
		let start: number | null = null;
		const totalDuration = 5000;

		// Randomly select a final segment index
		const randomSegmentIndex = Math.floor(Math.random() * wheelData.length);
		const finalAngle = randomSegmentIndex * SEGMENT_ANGLE;

		const animate = (timestamp: number) => {
			if (!start) start = timestamp;
			const elapsed = timestamp - start;
			const progress = Math.min(elapsed / totalDuration, 1);

			// Easing function for smooth deceleration
			const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
			const easedProgress = easeOut(progress);

			// Start with a high initial spin and gradually slow down to the final angle
			const spinMultiplier = Math.PI * 20; // Arbitrary large spins at the start
			const angle =
				(1 - easedProgress) * spinMultiplier + easedProgress * finalAngle;

			// Ball radius logic for smooth dropping
			const maxRadius = WHEEL_RADIUS + OUTER_WALL_WIDTH / 2; // Outer radius
			const minRadius = WHEEL_RADIUS - 10; // Inner target radius
			const radius =
				easedProgress < 0.9
					? maxRadius
					: maxRadius - ((easedProgress - 0.9) / 0.1) * (maxRadius - minRadius);

			// Update ball position
			const x = Math.cos(angle) * radius;
			const y = Math.sin(angle) * radius;

			setBallPosition({ x, y });

			if (progress < 1) {
				animationRef.current = requestAnimationFrame(animate);
			} else {
				const adjustedAngle = finalAngle + SEGMENT_ANGLE / 2; // Center the ball visually
				const finalX = Math.cos(adjustedAngle) * minRadius;
				const finalY = Math.sin(adjustedAngle) * minRadius;
				setBallPosition({ x: finalX, y: finalY });
				// Log the final segment number
				console.log(`Ball landed on: ${wheelData[randomSegmentIndex].number}`);
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
					{/* Outer wooden circle */}
					<circle r={WHEEL_RADIUS + OUTER_WALL_WIDTH} fill="#8B4513" />
					{/* Inner wheel */}
					<circle r={WHEEL_RADIUS} fill="#3a3a3a" />
					{/* Segments */}
					<g>
						{wheelData.map((segment, index) => (
							<WheelSegment
								key={segment.number}
								segment={segment}
								index={index}
							/>
						))}
					</g>
					{/* Ball */}
					<circle
						cx={ballPosition.x}
						cy={ballPosition.y}
						r={BALL_RADIUS}
						fill="white"
					/>
					{/* Center wood with gold circle */}
					<circle r={WHEEL_RADIUS - 30} fill="#8B4513" />
					<circle r={WHEEL_RADIUS - 100} fill="gold" />
					{/* Segment dividers */}
					{Array.from({ length: 37 }).map((_, index) => {
						const angle = index * SEGMENT_ANGLE;
						const innerX = Math.cos(angle) * WHEEL_RADIUS;
						const innerY = Math.sin(angle) * WHEEL_RADIUS;
						const outerX = Math.cos(angle) * (WHEEL_RADIUS + OUTER_WALL_WIDTH);
						const outerY = Math.sin(angle) * (WHEEL_RADIUS + OUTER_WALL_WIDTH);
						return (
							<line
								key={index}
								x1={innerX}
								y1={innerY}
								x2={outerX}
								y2={outerY}
								stroke="#5d3a1a"
								strokeWidth="2"
							/>
						);
					})}
				</g>
			</svg>
			<button
				onClick={spinWheel}
				disabled={spinning}
				className="bg-purple-500 py-4 px-8 text-white rounded-lg"
			>
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
