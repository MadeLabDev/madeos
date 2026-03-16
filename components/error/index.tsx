export default function Error() {
	const reload = () => {
		window.location.reload();
	};

	return (
		<div className={`mx-auto py-5 lg:px-10`}>
			<h1 className="mb-3 text-4xl font-bold">Error!</h1>
			<h2 className="mb-3">Something went wrong!</h2>
			<button
				onClick={() => reload()}
				className="block bg-black px-5 py-2 text-white dark:bg-white dark:text-black">
				Try again
			</button>
		</div>
	);
}
