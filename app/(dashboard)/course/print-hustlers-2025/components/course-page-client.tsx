"use client";

import { useEffect, useState } from "react";

import { Home, Menu } from "lucide-react";
import { Download, Link as LinkIcon, Play } from "lucide-react";
import Link from "next/link";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { JoinModal } from "@/components/dashboard/join-modal";
import { ImageLightbox, YouTubeLightbox } from "@/components/media/lightbox";
import { Button } from "@/components/ui/button";
import { LoadingImage } from "@/components/ui/loading-image";

import img_1 from "../medias/img_1.jpg";
import img_2 from "../medias/img_2.jpg";
import img_3 from "../medias/img_3.jpg";
import img_4 from "../medias/img_4.jpg";
import img_5 from "../medias/img_5.jpg";
import img_6 from "../medias/img_6.jpg";
import img_7 from "../medias/img_7.jpg";
import img_8 from "../medias/img_8.jpg";
import img_9 from "../medias/img_9.jpg";
import img_10 from "../medias/img_10.jpg";
import img_11 from "../medias/img_11.jpg";
import img_12 from "../medias/img_12.jpg";
import img_13 from "../medias/img_13.jpg";
import img_14 from "../medias/img_14.jpg";
import img_15 from "../medias/img_15.jpg";
import img_16 from "../medias/img_16.jpg";
import sp from "../medias/sp.jpeg";

import { AIAssistant } from "./ai-assistant";
import { SessionSidebar } from "./session-sidebar";

interface CoursePageClientProps {
	course: any;
}

export function CoursePageClient({ course: _course }: CoursePageClientProps) {
	const [isMobile, setIsMobile] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// Check if mobile screen
	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			// On mobile, sidebar starts closed
			if (mobile) {
				setIsSidebarOpen(false);
			} else {
				// On desktop, sidebar starts open
				setIsSidebarOpen(true);
			}
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<>
			<SetBreadcrumb
				segment="print-hustlers-2025"
				label="Print Hustlers 2025"
			/>

			<div className="bg-background -m-6 flex min-h-screen">
				{/* Mobile overlay */}
				{isMobile && isSidebarOpen && (
					<div
						className="fixed inset-0 z-40 bg-black/50 md:hidden"
						onClick={toggleSidebar}
					/>
				)}

				{/* Sidebar */}
				<div className={` ${isMobile ? "fixed top-0 left-0 z-501" : "relative"} ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"} transition-transform duration-300 ease-in-out`}>
					<SessionSidebar onClose={isMobile ? toggleSidebar : undefined} />
				</div>

				{/* Main Content */}
				<div className={`flex-1 overflow-y-auto transition-all duration-300 ${isMobile ? "ml-0" : "ml-0"} `}>
					{/* Mobile Header */}
					{isMobile && (
						<div className="bg-background fixed top-0 right-0 left-0 z-[500] flex h-16 items-center gap-4 border-b px-4 shadow-md">
							<Link
								href="/dashboard"
								className="shrink-0">
								<Button
									variant="ghost"
									size="icon"
									className="shrink-0">
									<Home className="h-5 w-5" />
									<span className="sr-only">Go to Dashboard</span>
								</Button>
							</Link>

							<div className="flex-1">
								<h1 className="text-lg font-bold">Print Hustlers 2025</h1>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleSidebar}
								className="shrink-0">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle sidebar</span>
							</Button>
						</div>
					)}

					<div className={`container mx-auto max-w-4xl px-8 py-8 ${isMobile ? "pt-20" : ""}`}>
						<h1 className="mb-3">WELCOME TO THE PRINT HUSTLERS 2025 ON-DEMAND PASS</h1>
						<p className="mb-3">This is your exclusive hub for every session, workshop, and resource from this year’s event at The Second City in Chicago. Inside, you’ll find full-length presentation videos, downloadable speaker materials, and bonus insights to help you implement what you learned. Join our exclusive Google Chat to ask questions and interact.</p>
						<div className="btngroup mb-15 flex items-center gap-3 space-x-3">
							<JoinModal>
								<Button className="cursor-pointer rounded-none">Click Here To Join</Button>
							</JoinModal>
						</div>
						{/* AI Assistant floating helper */}
						<AIAssistant />

						{/* Start Seation 1  */}
						<section
							id="session-1"
							className="mb-10">
							<h2>Session 1.</h2>
							<h3 className="mb-5 text-xl opacity-60">Rob Cressy – Unlock the Power of AI</h3>

							<div className="imagegroup mb-5 grid grid-cols-2 gap-5">
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_1.src}
										alt="Rob Cressy speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_1.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											alt="Rob Cressy speaking at Print Hustlers 2025"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
										/>
									</ImageLightbox>
								</div>
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_2.src}
										alt="Rob Cressy speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_2.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											alt="Rob Cressy speaking at Print Hustlers 2025"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
										/>
									</ImageLightbox>
								</div>
							</div>

							<div className="border-border mb-3 border bg-black/5 p-3 text-xl">
								<strong>Who he is: </strong> Rob is an entrepreneur, creator, and mindset strategist known for helping leaders adopt AI as a creative partner—not a replacement.
							</div>
							<p className="mb-3">
								<strong>Session Summary: </strong>
								Rob demonstrates how AI becomes an amplifier of your creativity and productivity when you take the time to personalize it with your voice, goals, and thinking patterns.
							</p>
							<p className="mb-3">
								<strong>What you’ll learn: </strong>
								How to train ChatGPT to understand your tone and communication style
							</p>
							<ul className="ml-5 list-disc space-y-2">
								<li>A workflow for using AI as your “idea accelerator”</li>
								<li>How to use Voice Chat to capture ideas in motion</li>
								<li>Practical examples for automating thought work and business planning</li>
							</ul>

							<div className="btngroup mt-5 flex space-x-3">
								<span className="inline">
									<YouTubeLightbox url="https://www.youtube.com/watch?v=MxBYoCSXobg">
										<Button className="flex cursor-pointer items-center gap-2 rounded-none">
											<Play className="h-4 w-4" />
											Presentation
										</Button>
									</YouTubeLightbox>
								</span>
								<Link
									href="https://robcressy.ai/best-chatgpt-prompts"
									target="_blank">
									<Button className="flex cursor-pointer items-center gap-2 rounded-none">
										<LinkIcon className="h-4 w-4" />
										Resources
									</Button>
								</Link>
							</div>
						</section>

						<hr className="my-10" />

						{/* End Section 1 */}

						{/* Start Section 2 */}
						<section
							id="session-2"
							className="mb-10">
							<h2>Session 2.</h2>
							<h3 className="mb-5 text-xl opacity-60">Megan Spire (Bella+Canvas) – Selling with Higher Perceived Value</h3>

							<div className="imagegroup mb-5 grid grid-cols-2 gap-5">
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_3.src}
										alt="Megan Spire speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_3.src}
											width={800}
											height={600}
											className="h-full w-full object-cover object-[center_30%]"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Megan Spire speaking at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_4.src}
										alt="Megan Spire speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_4.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Megan Spire speaking at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
							</div>

							<div className="border-border mb-3 border bg-black/5 p-3 text-xl">
								<strong>Who she is: </strong> Megan is the VP of Sales at Bella+Canvas and a leading voice in premium apparel storytelling and branding.
							</div>
							<p className="mb-3">
								<strong>Session Summary: </strong>
								Megan explains how to sell apparel by emotion—not discounts—so customers value the story, feel, and memory associated with their merch.
							</p>
							<p className="mb-3">
								<strong>What you’ll learn: </strong>
								Why perceived value drives profit more than product cost
							</p>
							<ul className="ml-5 list-disc space-y-2">
								<li>How to create "I was there" moments with apparel</li>
								<li>Techniques to build emotional connection through finishing and storytelling</li>
								<li>Why "the cost goes down with every wear"</li>
							</ul>

							<div className="btngroup mt-5 flex space-x-3">
								<span className="inline">
									<YouTubeLightbox url="https://youtu.be/7VPaz7suDTA">
										<Button className="flex cursor-pointer items-center gap-2 rounded-none">
											<Play className="h-4 w-4" />
											Presentation
										</Button>
									</YouTubeLightbox>
								</span>
								<Link
									href="https://drive.google.com/file/d/1MISbd1F_tVnEb0VrIKLMrnzlnSnhdB-Q/view?usp=sharing"
									target="_blank">
									<Button className="flex cursor-pointer items-center gap-2 rounded-none">
										<Download className="h-4 w-4" />
										Downloads
									</Button>
								</Link>
							</div>
						</section>

						<hr className="my-10" />

						{/* End Section 2 */}

						{/* Start Section 3 */}
						<section
							id="session-3"
							className="mb-10">
							<h2>Session 3.</h2>
							<h3 className="mb-5 text-xl opacity-60">Alex Chausovsky – Economic Forecast 2026</h3>

							<div className="imagegroup mb-5 grid grid-cols-2 gap-5">
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_5.src}
										alt="Alex Chausovsky speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_5.src}
											width={800}
											height={600}
											className="h-full w-full object-cover object-[center_30%]"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Alex Chausovsky speaking at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_6.src}
										alt="Alex Chausovsky speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_6.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Alex Chausovsky speaking at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
							</div>

							<div className="border-border mb-3 border bg-black/5 p-3 text-xl">
								<strong>Who he is: </strong> Alex is a global economist and keynote speaker specializing in forecasting, business strategy, and industrial trends.
							</div>
							<p className="mb-3">
								<strong>Session Summary: </strong>
								Alex delivers a direct, grounded analysis of what shops can realistically expect from the next two years—and where the opportunities lie in a flat market.
							</p>
							<p className="mb-3">
								<strong>What you’ll learn: </strong>
								Why 2026 will likely hover around ~1% growth
							</p>
							<ul className="ml-5 list-disc space-y-2">
								<li>What a "not hiring, not firing" economy means for shops</li>
								<li>How to raise prices strategically based on customer tiers</li>
								<li>Why retaining top employees is key before the next upswing</li>
								<li>How tariffs and global uncertainty affect decorators</li>
							</ul>

							<div className="btngroup mt-5 flex space-x-3">
								<span className="inline">
									<YouTubeLightbox url="https://youtu.be/KvC4kwFVYks">
										<Button className="flex cursor-pointer items-center gap-2 rounded-none">
											<Play className="h-4 w-4" />
											Presentation
										</Button>
									</YouTubeLightbox>
								</span>
								<Link
									href="https://drive.google.com/file/d/1tpWqHj5947NRG66WIeNUMpPpPHhcIFxa/view?usp=sharing"
									target="_blank">
									<Button className="flex cursor-pointer items-center gap-2 rounded-none">
										<Download className="h-4 w-4" />
										Downloads
									</Button>
								</Link>
							</div>
						</section>

						<hr className="my-10" />

						{/* End Section 3 */}

						{/* Start Section 4 */}
						<section
							id="session-4"
							className="mb-10">
							<h2>Session 4.</h2>
							<h3 className="mb-5 text-xl opacity-60">The Second City – Improv In Business</h3>

							<div className="imagegroup mb-5 grid grid-cols-2 gap-5">
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_7.src}
										alt="The Second City team at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_7.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="The Second City team at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_8.src}
										alt="The Second City team at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_8.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="The Second City team at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
							</div>

							<div className="border-border mb-3 border bg-black/5 p-3 text-xl">
								<strong>Who they are: </strong> The world-famous Chicago improv institution that trained countless comedy legends.
							</div>
							<p className="mb-3">
								<strong>Session Summary: </strong>
								The Second City team led interactive improv-based sales and communication workshops focused on collaboration, presence, and listening.
							</p>
							<p className="mb-3">
								<strong>What you’ll learn: </strong>
								The power of "Yes, and…" in conversations
							</p>
							<ul className="ml-5 list-disc space-y-2">
								<li>How to improve listening, presence, and customer connection</li>
								<li>Skills to strengthen team culture and sales communication</li>
								<li>Exercises to break patterns and unlock new thinking</li>
								<li>PLEASE - DO THESE EXERCISES WITH YOUR TEAM!</li>
							</ul>

							<div className="btngroup mt-5 flex space-x-3">
								<span className="inline">
									<YouTubeLightbox url="https://youtu.be/4u5wktIlHIE">
										<Button className="flex cursor-pointer items-center gap-2 rounded-none">
											<Play className="h-4 w-4" />
											Presentation
										</Button>
									</YouTubeLightbox>
								</span>
								<Link
									href="https://www.secondcity.com/second-city-works/on-demand-learning"
									target="_blank">
									<Button className="flex cursor-pointer items-center gap-2 rounded-none">
										<LinkIcon className="h-4 w-4" />
										Resources
									</Button>
								</Link>
							</div>
						</section>

						<hr className="my-10" />

						{/* End Section 4 */}

						{/* Start Section 5 */}
						<section
							id="session-5"
							className="mb-10">
							<h2>Session 5.</h2>
							<h3 className="mb-5 text-xl opacity-60">Live Print Hustlers Podcast – Dan Frank from Silverscreen</h3>

							<div className="imagegroup mb-5 grid grid-cols-2 gap-5">
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_9.src}
										alt="Dan Frank speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_9.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Dan Frank speaking at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_10.src}
										alt="Dan Frank speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_10.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Dan Frank speaking at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
							</div>

							<div className="border-border mb-3 border bg-black/5 p-3 text-xl">
								<strong>Who he is: </strong> Dan is the founder of Silverscreen, a rapidly growing print shop excelling in retail markets and scaling operations.
							</div>
							<p className="mb-3">
								<strong>Session Summary: </strong>A live conversation about the journey from startup to large-scale production, building teams, and navigating growth.
							</p>
							<p className="mb-3">
								<strong>What you’ll learn: </strong>
								How Silverscreen scaled without losing quality
							</p>
							<ul className="ml-5 list-disc space-y-2">
								<li>Lessons learned from both retail and client work</li>
								<li>What’s changed in his shop since his Shirt Show episode</li>
								<li>How to think about growth systems, teams, and capacity</li>
							</ul>

							<div className="btngroup mt-5 flex space-x-3">
								<span className="inline">
									<YouTubeLightbox url="https://youtu.be/uzPIp6SqLKs">
										<Button className="flex cursor-pointer items-center gap-2 rounded-none">
											<Play className="h-4 w-4" />
											Presentation
										</Button>
									</YouTubeLightbox>
								</span>
								<Link
									href="https://www.linkedin.com/in/daniel-frank-60766aa"
									target="_blank">
									<Button className="flex cursor-pointer items-center gap-2 rounded-none">
										<LinkIcon className="h-4 w-4" />
										Resources
									</Button>
								</Link>
							</div>
						</section>

						<hr className="my-10" />

						{/* End Section 5 */}

						{/* Start Section 6 */}
						<section
							id="session-6"
							className="mb-10">
							<h2>Session 6.</h2>
							<h3 className="mb-5 text-xl opacity-60">Steven Farag and Justin Lawrence - Intro Licensing To Licensing</h3>

							<div className="imagegroup mb-5 grid grid-cols-2 gap-5">
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_11.src}
										alt="Steven Farag and Justin Lawrence at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_11.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Steven Farag and Justin Lawrence at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_12.src}
										alt="Steven Farag and Justin Lawrence at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_12.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Steven Farag and Justin Lawrence at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
							</div>

							<div className="btngroup mt-5 flex space-x-3">
								<span className="inline">
									<YouTubeLightbox url="https://youtu.be/YImOGdP2ndo">
										<Button className="flex cursor-pointer items-center gap-2 rounded-none">
											<Play className="h-4 w-4" />
											Presentation
										</Button>
									</YouTubeLightbox>
								</span>
								<Link
									href="https://brandmanager360.com/Account/RegisterApplicant"
									target="_blank">
									<Button className="flex cursor-pointer items-center gap-2 rounded-none">
										<LinkIcon className="h-4 w-4" />
										Resources
									</Button>
								</Link>
							</div>
						</section>

						<hr className="my-10" />

						{/* End Section 6 */}

						{/* Start Section 7 */}
						<section
							id="session-7"
							className="mb-10">
							<h2>Session 7.</h2>
							<h3 className="mb-5 text-xl opacity-60">SanMar Update</h3>

							<div className="imagegroup mb-5 grid grid-cols-2 gap-5">
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_13.src}
										alt="SanMar team at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_13.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="SanMar team at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_14.src}
										alt="SanMar team at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_14.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="SanMar team at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
							</div>

							<p className="mb-3">
								<strong>Summary: </strong>
								SanMar unveiled their brand-new 3D Product Visualizer, launching November 6th.
							</p>
							<p className="mb-3">
								<strong>What you’ll learn: </strong>
								How the new 3D mockup tool works
							</p>
							<ul className="ml-5 list-disc space-y-2">
								<li>Why 3D visuals will help decorators sell faster</li>
								<li>Use cases for customer approvals, ecommerce, and sales</li>
							</ul>

							<div className="btngroup mt-5 flex space-x-3">
								<span className="inline">
									<YouTubeLightbox url="https://youtu.be/MU7-CsK61EA">
										<Button className="flex cursor-pointer items-center gap-2 rounded-none">
											<Play className="h-4 w-4" />
											Presentation
										</Button>
									</YouTubeLightbox>
								</span>
								<Link
									href="https://drive.google.com/file/d/1avLyDuYnKeOqK5sr-hkKfGdUchMArq3X/view?usp=sharing"
									target="_blank">
									<Button className="flex cursor-pointer items-center gap-2 rounded-none">
										<Download className="h-4 w-4" />
										Downloads
									</Button>
								</Link>
							</div>
						</section>

						<hr className="my-10" />

						{/* End Section 7 */}

						{/* Start Section 8 */}
						<section
							id="session-8"
							className="mb-10">
							<h2>Session 8.</h2>
							<h3 className="mb-5 text-xl opacity-60">Mike Niemczyk – Effective Marketing in a Content-Crazy World</h3>

							<div className="imagegroup mb-5 grid grid-cols-2 gap-5">
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_15.src}
										alt="Mike Niemczyk speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_15.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Mike Niemczyk speaking at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
								<div className="aspect-video overflow-hidden">
									<ImageLightbox
										src={img_16.src}
										alt="Mike Niemczyk speaking at Print Hustlers 2025"
										width={800}
										height={600}>
										<LoadingImage
											src={img_16.src}
											width={800}
											height={600}
											className="h-full w-full object-cover"
											loading="lazy"
											decoding="async"
											containerClassName="w-full h-auto aspect-[16/9] border-b border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
											alt="Mike Niemczyk speaking at Print Hustlers 2025"
										/>
									</ImageLightbox>
								</div>
							</div>

							<div className="border-border mb-3 border bg-black/5 p-3 text-xl">
								<strong>Who he is: </strong> Mike is a digital strategist who specializes in modern social media behavior and discovery-based algorithms.
							</div>
							<p className="mb-3">
								<strong>Session Summary: </strong>
								Mike breaks down how social media has shifted from "community" to "discovery"—and what shops must change to stay visible.
							</p>
							<p className="mb-3">
								<strong>What you’ll learn: </strong>
								Why discovery now beats engagement
							</p>
							<ul className="ml-5 list-disc space-y-2">
								<li>How algorithms actually choose content</li>
								<li>How to create scroll-stopping videos without overthinking</li>
								<li>What authenticity means in a world of algorithm-fed doom scrolling</li>
							</ul>

							<div className="btngroup mt-5 flex space-x-3">
								<span className="inline">
									<YouTubeLightbox url="https://youtu.be/_Vnxm1MM_Zk">
										<Button className="flex cursor-pointer items-center gap-2 rounded-none">
											<Play className="h-4 w-4" />
											Presentation
										</Button>
									</YouTubeLightbox>
								</span>
								<Link
									href="https://www.linkedin.com/in/mikeczyk/"
									target="_blank">
									<Button className="flex cursor-pointer items-center gap-2 rounded-none">
										<LinkIcon className="h-4 w-4" />
										Resources
									</Button>
								</Link>
							</div>
						</section>

						{/* End Section 8 */}

						<h4>Thanks for subscribing to Print Hustlers On-Demand! Hope to see you next year in person.</h4>

						<div className="mt-15">
							<ImageLightbox
								src={sp.src}
								alt="Rob Cressy speaking at Print Hustlers 2025"
								width={800}
								height={600}>
								<LoadingImage
									src={sp.src}
									width={800}
									height={600}
									className="h-full w-full object-cover"
									loading="lazy"
									decoding="async"
									containerClassName="w-full h-auto aspect-[16/9] bg-muted overflow-hidden flex-shrink-0 rounded-lg rounded-none order-1"
									alt="Rob Cressy speaking at Print Hustlers 2025"
								/>
							</ImageLightbox>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
