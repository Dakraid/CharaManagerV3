export type DiffPart = { value: string; color: 'green' | 'red' | 'grey' };

export type ChatCompletionPresetBundle = {
	title: string;
	presetParsed: ChatCompletionPreset;
	presetJSON: string;
}

export type ChatCompletionPreset = {
	temperature:              number;
	frequency_penalty:        number;
	presence_penalty:         number;
	top_p:                    number;
	top_k:                    number;
	top_a:                    number;
	min_p:                    number;
	repetition_penalty:       number;
	openai_max_context:       number;
	openai_max_tokens:        number;
	wrap_in_quotes:           boolean;
	names_behavior:           number;
	send_if_empty:            string;
	impersonation_prompt:     string;
	new_chat_prompt:          string;
	new_group_chat_prompt:    string;
	new_example_chat_prompt:  string;
	continue_nudge_prompt:    string;
	bias_preset_selected:     string;
	max_context_unlocked:     boolean;
	wi_format:                string;
	scenario_format:          string;
	personality_format:       string;
	group_nudge_prompt:       string;
	stream_openai:            boolean;
	prompts:                  Prompt[];
	prompt_order:             PromptOrder[];
	assistant_prefill:        string;
	assistant_impersonation:  string;
	claude_use_sysprompt:     boolean;
	use_makersuite_sysprompt: boolean;
	squash_system_messages:   boolean;
	image_inlining:           boolean;
	inline_image_quality:     string;
	video_inlining:           boolean;
	continue_prefill:         boolean;
	continue_postfix:         string;
	function_calling:         boolean;
	show_thoughts:            boolean;
	reasoning_effort:         string;
	enable_web_search:        boolean;
	request_images:           boolean;
	seed:                     number;
	n:                        number;
	extensions:               Extensions;
}

export type Extensions = {
}

export type PromptOrder = {
	character_id: number;
	order:        Order[];
}

export type Order = {
	identifier: string;
	enabled:    boolean;
}

export type Prompt = {
	name:                string;
	system_prompt:       boolean;
	role?:               Role;
	content?:            string;
	diffParts?:          DiffPart[];
	identifier:          string;
	injection_position?: number;
	injection_depth?:    number;
	injection_order?:    number;
	injection_trigger?:  any[];
	forbid_overrides?:   boolean;
	marker?:             boolean;
	enabled?:            boolean;
}

export enum Role {
	Assistant = "assistant",
	System = "system",
	User = "user"
}
