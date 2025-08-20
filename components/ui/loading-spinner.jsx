"use client"

export default function LoadingSpinner({ className = "", size = "default" }) {
	// Size variants
	const sizes = {
		small: { width: '16px', height: '16px', padding: '2px' },
		default: { width: '54px', height: '54px', padding: '10px' },
		large: { width: '72px', height: '72px', padding: '12px' }
	}
	
	const currentSize = sizes[size] || sizes.default
	
	return (
		<div className={`spinner ${className}`}>
			<div className="bar1"></div>
			<div className="bar2"></div>
			<div className="bar3"></div>
			<div className="bar4"></div>
			<div className="bar5"></div>
			<div className="bar6"></div>
			<div className="bar7"></div>
			<div className="bar8"></div>
			<div className="bar9"></div>
			<div className="bar10"></div>
			<div className="bar11"></div>
			<div className="bar12"></div>

			<style jsx>{`
				.spinner {
					position: relative;
					width: ${currentSize.width};
					height: ${currentSize.height};
					display: inline-block;
					margin-left: ${size === 'small' ? '0' : '50%'};
					margin-right: ${size === 'small' ? '0' : '50%'};
					padding: ${currentSize.padding};
					border-radius: 10px;
				}

				.spinner div {
					width: 6%;
					height: 16%;
					background: #ffffff;
					position: absolute;
					left: 49%;
					top: 43%;
					opacity: 0;
					border-radius: 50px;
					box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
					animation: fade 1s linear infinite;
				}

				@keyframes fade {
					from { opacity: 1; }
					to { opacity: 0.25; }
				}

				.spinner .bar1 { transform: rotate(0deg) translate(0, -130%); animation-delay: 0s; }
				.spinner .bar2 { transform: rotate(30deg) translate(0, -130%); animation-delay: -0.9167s; }
				.spinner .bar3 { transform: rotate(60deg) translate(0, -130%); animation-delay: -0.833s; }
				.spinner .bar4 { transform: rotate(90deg) translate(0, -130%); animation-delay: -0.7497s; }
				.spinner .bar5 { transform: rotate(120deg) translate(0, -130%); animation-delay: -0.667s; }
				.spinner .bar6 { transform: rotate(150deg) translate(0, -130%); animation-delay: -0.5837s; }
				.spinner .bar7 { transform: rotate(180deg) translate(0, -130%); animation-delay: -0.5s; }
				.spinner .bar8 { transform: rotate(210deg) translate(0, -130%); animation-delay: -0.4167s; }
				.spinner .bar9 { transform: rotate(240deg) translate(0, -130%); animation-delay: -0.333s; }
				.spinner .bar10 { transform: rotate(270deg) translate(0, -130%); animation-delay: -0.2497s; }
				.spinner .bar11 { transform: rotate(300deg) translate(0, -130%); animation-delay: -0.167s; }
				.spinner .bar12 { transform: rotate(330deg) translate(0, -130%); animation-delay: -0.0833s; }
			`}</style>
		</div>
	);
}


