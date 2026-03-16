"use client";

import { useEffect, useRef, useState } from "react";

import { ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getEvents } from "@/lib/features/events/actions";
import { cn } from "@/lib/utils";

interface Event {
	id: string;
	title: string;
}

interface EventsInputWithAutocompleteProps {
	selectedEventIds: string[];
	onChange: (eventIds: string[]) => void;
	placeholder?: string;
	className?: string;
}

export function EventsInputWithAutocomplete({ selectedEventIds, onChange, placeholder = "Search events...", className }: EventsInputWithAutocompleteProps) {
	const [events, setEvents] = useState<Event[]>([]);
	const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
	const [inputValue, setInputValue] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Load events on mount
	useEffect(() => {
		const loadEvents = async () => {
			setLoading(true);
			try {
				const result = await getEvents();
				if (result.success && result.data) {
					setEvents(result.data);
					setFilteredEvents(result.data);
				}
			} catch (error) {
				console.error("Failed to load events:", error);
			} finally {
				setLoading(false);
			}
		};

		loadEvents();
	}, []);

	// Filter events based on input
	useEffect(() => {
		if (!inputValue.trim()) {
			setFilteredEvents(events);
		} else {
			const filtered = events.filter((event) => event.title.toLowerCase().includes(inputValue.toLowerCase()));
			setFilteredEvents(filtered);
		}
	}, [inputValue, events]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedEvents = events.filter((event) => selectedEventIds.includes(event.id));

	const handleInputChange = (value: string) => {
		setInputValue(value);
		setIsOpen(true);
	};

	const handleEventSelect = (event: Event) => {
		if (!selectedEventIds.includes(event.id)) {
			onChange([...selectedEventIds, event.id]);
		}
		setInputValue("");
		setIsOpen(false);
		inputRef.current?.focus();
	};

	const handleEventRemove = (eventId: string) => {
		onChange(selectedEventIds.filter((id) => id !== eventId));
	};

	const handleInputFocus = () => {
		setIsOpen(true);
	};

	const availableEvents = filteredEvents.filter((event) => !selectedEventIds.includes(event.id));

	return (
		<div className={cn("relative", className)}>
			{/* Selected Events */}
			{selectedEvents.length > 0 && (
				<div className="mb-2 flex flex-wrap gap-2">
					{selectedEvents.map((event) => (
						<div
							key={event.id}
							className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm">
							<span>{event.title}</span>
							<button
								type="button"
								onClick={() => handleEventRemove(event.id)}
								className="text-current hover:opacity-70">
								<X size={14} />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Input */}
			<div className="relative">
				<Input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={(e) => handleInputChange(e.target.value)}
					onFocus={handleInputFocus}
					placeholder={placeholder}
					className="pr-10"
				/>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
					onClick={() => setIsOpen(!isOpen)}>
					<ChevronDown className="h-4 w-4" />
				</Button>
			</div>

			{/* Dropdown */}
			{isOpen && (
				<div
					ref={dropdownRef}
					className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
					{loading ? (
						<div className="px-3 py-2 text-sm text-gray-500">Loading events...</div>
					) : availableEvents.length === 0 ? (
						<div className="px-3 py-2 text-sm text-gray-500">{inputValue.trim() ? "No events found" : "No more events available"}</div>
					) : (
						availableEvents.map((event) => (
							<button
								key={event.id}
								type="button"
								className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
								onClick={() => handleEventSelect(event)}>
								<div className="text-sm font-medium">{event.title}</div>
							</button>
						))
					)}
				</div>
			)}
		</div>
	);
}
