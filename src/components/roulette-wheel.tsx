import { useState } from "react";
import { generateWheelData, IWheelSegment } from "@/utils/wheel";

const WHEEL_RADIUS = 250;
const CENTER = WHEEL_RADIUS + 20;
const SEGMENT_ANGLE = (2 * Math.PI) / 37;

export default function RouletteWheel() {
	const [rotation, setRotation] = useState(0);
	const [spinning, setSpinning] = useState(false);
	const wheelData = generateWheelData();

	const spinWheel = () => {
		if (spinning) return;
		setSpinning(true);
		const spinAngle = 360 * 5 + Math.random() * 360; // Spin at least 5 full rotations
		setRotation((prevRotation) => prevRotation + spinAngle);
		setTimeout(() => setSpinning(false), 5000);
	};

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
				</g>
				<g
					transform={`translate(${CENTER}, ${CENTER}) rotate(${rotation})`}
					style={{
						transition: "transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)",
					}}
				>
					<polygon points="0,-10 10,0 0,10 -10,0" fill="white" />
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
