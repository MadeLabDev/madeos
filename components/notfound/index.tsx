import Link from "next/link";

export default function NotFound() {
	return (
		<section className={`mx-auto flex min-h-full`}>
			<div className={`mx-auto block min-h-full w-full bg-black p-10 text-white`}>
				<div className="container mx-auto h-full max-w-[640px] lg:flex lg:max-w-[990px] lg:flex-col lg:justify-center lg:px-10 xl:max-w-[1800px]">
					<div className="pageerror__content">
						<div className="flex flex-col">
							<div className="mt-20 flex items-center">
								<div className="font-6xl">
									<svg
										className="h-[80px] w-[80px] fill-white xl:h-[200px] xl:w-[200px]"
										viewBox="30 60 90 90"
										fill="none"
										xmlns="http://www.w3.org/2000/svg">
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M38.155 140.475L48.988 62.1108L92.869 67.0568L111.437 91.0118L103.396 148.121L38.155 140.475ZM84.013 94.0018L88.827 71.8068L54.046 68.3068L44.192 135.457L98.335 142.084L104.877 96.8088L84.013 94.0018ZM59.771 123.595C59.394 123.099 56.05 120.299 55.421 119.433C64.32 109.522 86.05 109.645 92.085 122.757C91.08 123.128 86.59 125.072 85.71 125.567C83.192 118.25 68.445 115.942 59.771 123.595ZM76.503 96.4988L72.837 99.2588L67.322 92.6168L59.815 96.6468L56.786 91.5778L63.615 88.1508L59.089 82.6988L64.589 79.0188L68.979 85.4578L76.798 81.5328L79.154 86.2638L72.107 90.0468L76.503 96.4988Z"
										/>
									</svg>
								</div>
								<h2 className="xl:text-11xl my-3 flex flex-row text-3xl leading-none font-normal sm:text-5xl md:text-4xl lg:text-6xl xl:ml-5">
									<span>Error 404!</span>
								</h2>
							</div>
							<h2 className="font-semkibold mt-20 mb-3 text-3xl leading-none">Page not found!</h2>
							<p className="text-2xl font-light">Please check the URL or use the navigation to find what you are looking for.</p>
							<div className="mt-12">
								<Link
									href="/"
									className="text-md inline-block bg-white px-5 py-2 font-medium text-black">
									Home Page
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
