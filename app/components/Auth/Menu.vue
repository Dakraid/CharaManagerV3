<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { toast } from 'vue-sonner';
import * as z from 'zod/v4';

const { loggedIn, user, fetch, clear } = useUserSession();
const config = useRuntimeConfig();
const clientService = useClientService();

const registration = ref(false);

const signUpSchema = toTypedSchema(
	z.object({
		username: z.string().min(3).trim(),
		email: z.email().trim(),
		password: z.string().min(8).trim(),
	})
);

const signInSchema = toTypedSchema(
	z.object({
		login: z.union([z.string().min(3).trim(), z.email().trim()]),
		password: z.string().min(8).trim(),
	})
);

const signUpForm = useForm({
	validationSchema: signUpSchema,
});

const signInForm = useForm({
	validationSchema: signInSchema,
});

const onSignUp = signUpForm.handleSubmit(async (values) => {
	try {
		const result = await $fetch('/api/auth/register', {
			method: 'POST',
			body: {
				email: values.email,
				username: values.username,
				password: values.password,
			},
		});

		if (result.statusCode !== 200) {
			toast(result.message);
			return;
		}

		await fetch();
		await clientService.getCharacters();
		toast('User registered in successfully');
	} catch (error) {
		console.error('Registration error:', error);
		toast('Registration failed. Please try again.');
	}
});

const onSignIn = signInForm.handleSubmit(async (values) => {
	try {
		const result = await $fetch('/api/auth/login', {
			method: 'POST',
			body: {
				login: values.login,
				password: values.password,
			},
		});

		if (result.statusCode !== 200) {
			toast(result.message);
			return;
		}

		await fetch();
		await clientService.getCharacters();
		toast('User logged in successfully');
	} catch (error) {
		console.error('Login error:', error);
		toast('Login failed. Please check your credentials.');
	}
});

async function logout() {
	await clear();
	await clientService.getCharacters();
	toast('User logged out successfully');
}

async function showRegister(set: boolean) {
	if (!config.public.registrationEnabled) {
		registration.value = false;
		return;
	}
	registration.value = set;
}
</script>

<template>
	<div class="flex w-full max-w-sm flex-col gap-1">
		<ClientOnly>
			<Transition name="fade" mode="out-in">
				<div v-if="loggedIn" class="flex w-full flex-col gap-2">
					<h1 class="text-center">Welcome {{ user?.username }}!</h1>
					<Button variant="destructive" @click="logout">Logout</Button>
				</div>
				<div v-else-if="registration && config.public.registrationEnabled" class="w-full">
					<form class="flex flex-col" @submit="onSignUp">
						<FormField v-slot="{ componentField }" name="email" :validate-on-blur="!signUpForm.isFieldDirty">
							<FormItem>
								<FormLabel>E-Mail</FormLabel>
								<FormControl>
									<Input type="email" placeholder="Your E-Mail" v-bind="componentField" />
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<hr class="my-1 opacity-0" />

						<FormField v-slot="{ componentField }" name="username" :validate-on-blur="!signUpForm.isFieldDirty">
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input type="text" placeholder="Your Username" v-bind="componentField" />
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<hr class="my-1 opacity-0" />

						<FormField v-slot="{ componentField }" name="password" :validate-on-blur="!signUpForm.isFieldDirty">
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Your Password" v-bind="componentField" />
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<hr class="my-1 opacity-0" />

						<Button type="submit" class="w-full">Register</Button>

						<a class="cursor-pointer pr-4 text-end text-sm font-normal text-muted-foreground underline-offset-4 hover:text-accent-foreground hover:underline" @click="showRegister(false)"
							>Sign In</a
						>
					</form>
				</div>
				<div v-else class="w-full">
					<form class="flex flex-col" @submit="onSignIn">
						<FormField v-slot="{ componentField }" name="login" :validate-on-blur="!signInForm.isFieldDirty">
							<FormItem>
								<FormLabel>Login</FormLabel>
								<FormControl>
									<Input type="text" placeholder="Your E-Mail or Username" v-bind="componentField" />
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<hr class="my-1 opacity-0" />

						<FormField v-slot="{ componentField }" name="password" :validate-on-blur="!signInForm.isFieldDirty">
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type="password" placeholder="Your Password" v-bind="componentField" />
								</FormControl>
								<FormMessage />
							</FormItem>
						</FormField>

						<hr class="my-1 opacity-0" />

						<Button type="submit" class="w-full">Login</Button>

						<div v-if="registration && config.public.registrationEnabled" class="w-full">
							<a
								class="cursor-pointer pr-4 text-end text-sm font-normal text-muted-foreground underline-offset-4 hover:text-accent-foreground hover:underline"
								@click="showRegister(true)"
								>Sign Up</a
							>
						</div>
					</form>
				</div>
			</Transition>
		</ClientOnly>
	</div>
</template>

<style scoped></style>
