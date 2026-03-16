"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building, Mail, Phone, Send, User } from "lucide-react";
import { useForm } from "react-hook-form";
import SpeechRecognition from "react-speech-recognition";
import { toast } from "sonner";
import { z } from "zod";

import ContactSpeechToText from "@/components/contact/speech-to-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/ui/loader";
import { Textarea } from "@/components/ui/textarea";
import { type ContactFormData, submitContactForm } from "@/lib/features/contact";

// Static contact information
// const CONTACT_INFO = [
//   {
//     id: 'address',
//     category: 'Address',
//     title: 'Visit Our Office',
//     content: '501 E Broadway Ave, Fort Worth, TX 76104',
//     icon: MapPin,
//   },
//   {
//     id: 'email',
//     category: 'Email',
//     title: 'Email Support',
//     content: 'support@madelab.io',
//     icon: Mail,
//   },
//   {
//     id: 'hours',
//     category: 'Business Hours',
//     title: 'Operating Hours',
//     content: 'Mon-Fri: 9AM-5PM PST',
//     icon: Clock,
//   },
// ];

export function ContactContent() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDesktop, setIsDesktop] = useState(false);

	useEffect(() => {
		const checkIsDesktop = () => {
			setIsDesktop(window.innerWidth >= 768); // md breakpoint
		};

		checkIsDesktop();
		window.addEventListener("resize", checkIsDesktop);

		return () => window.removeEventListener("resize", checkIsDesktop);
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<ContactFormData>({
		resolver: zodResolver(
			z.object({
				firstName: z.string().min(1, "First name is required"),
				lastName: z.string().min(1, "Last name is required"),
				email: z.string().email("Please enter a valid email address"),
				phone: z.string().min(1, "Phone number is required"),
				company: z.string().optional(),
				subject: z.string().min(1, "Subject is required"),
				content: z.string().min(10, "Message must be at least 10 characters"),
			}),
		),
	});

	const onSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);

		try {
			const result = await submitContactForm(data);

			if (result.success) {
				toast.success("Message sent successfully!", {
					description: result.message,
				});
				reset();
			} else {
				toast.error("Failed to send message", {
					description: result.message,
				});
			}
		} catch (error) {
			toast.error("Failed to send message", {
				description: "Please try again later.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-8">
			{/* Contact Form */}
			<div className="mx-auto max-w-2xl">
				<div className="mb-10 w-full flex-1 text-center">
					<h1 className="text-2xl font-bold sm:text-3xl">Contact Us</h1>
				</div>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Mail className="h-5 w-5" />
							Send us a message
						</CardTitle>
						<CardDescription>Have a question or need help? We'd love to hear from you.</CardDescription>
					</CardHeader>
					<CardContent>
						<form
							onSubmit={handleSubmit(onSubmit)}
							className="space-y-6">
							{/* Name Fields */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="firstName"
										className="flex items-center gap-2">
										<User className="h-4 w-4" />
										First Name *
									</Label>
									<Input
										id="firstName"
										{...register("firstName")}
										placeholder="Enter your first name"
									/>
									{errors.firstName && <p className="text-destructive text-sm">{errors.firstName.message}</p>}
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="lastName"
										className="flex items-center gap-2">
										<User className="h-4 w-4" />
										Last Name *
									</Label>
									<Input
										id="lastName"
										{...register("lastName")}
										placeholder="Enter your last name"
									/>
									{errors.lastName && <p className="text-destructive text-sm">{errors.lastName.message}</p>}
								</div>
							</div>

							{/* Contact Info */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label
										htmlFor="email"
										className="flex items-center gap-2">
										<Mail className="h-4 w-4" />
										Email *
									</Label>
									<Input
										id="email"
										type="email"
										{...register("email")}
										placeholder="your.email@example.com"
									/>
									{errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="phone"
										className="flex items-center gap-2">
										<Phone className="h-4 w-4" />
										Phone *
									</Label>
									<Input
										id="phone"
										{...register("phone")}
										placeholder="+1 (555) 123-4567"
									/>
									{errors.phone && <p className="text-destructive text-sm">{errors.phone.message}</p>}
								</div>
							</div>

							{/* Company */}
							<div className="space-y-2">
								<Label
									htmlFor="company"
									className="flex items-center gap-2">
									<Building className="h-4 w-4" />
									Company
								</Label>
								<Input
									id="company"
									{...register("company")}
									placeholder="Your company name (optional)"
								/>
							</div>

							{/* Subject */}
							<div className="space-y-2">
								<Label htmlFor="subject">Subject *</Label>
								<Input
									id="subject"
									{...register("subject")}
									placeholder="What's this about?"
								/>
								{errors.subject && <p className="text-destructive text-sm">{errors.subject.message}</p>}
							</div>

							{/* Message */}
							<div className="space-y-2">
								<Label htmlFor="content">Message *</Label>
								<div className="relative">
									<Textarea
										id="content"
										{...register("content")}
										placeholder="Tell us more about your inquiry..."
										rows={5}
									/>
									{isDesktop && (
										<div className="absolute right-3 bottom-3 z-10">
											<ContactSpeechToText />
										</div>
									)}
								</div>
								{errors.content && <p className="text-destructive text-sm">{errors.content.message}</p>}
								{isDesktop && (
									<>
										{/* Speech-to-text hint */}
										<p className="text-muted-foreground mt-2 text-sm">Click the microphone icon to speak — your message will be added to the Message field.</p>
										{/* Show support hint if the browser doesn't support web speech (mobile Safari and some browsers) */}
										{!SpeechRecognition.browserSupportsSpeechRecognition() && <p className="text-muted-foreground mt-1 text-xs">Speech-to-text is not available on your browser/device — try Chrome on Android or a desktop browser for best results.</p>}
									</>
								)}
							</div>

							{/* Submit Button */}
							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full">
								{isSubmitting ? (
									<>
										<Loader size="lg" />
										Sending...
									</>
								) : (
									<>
										<Send className="mr-2 h-4 w-4" />
										Send Message
									</>
								)}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>

			{/* Contact Information */}
			{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CONTACT_INFO.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <item.icon className="h-5 w-5" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div> */}
		</div>
	);
}
