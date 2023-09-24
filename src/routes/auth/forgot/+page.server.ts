import { fail } from '@sveltejs/kit';
import * as db from '$lib/server/db';
import { z } from 'zod';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { sendResetEmail } from '$lib/server/mail.js';
import { APP_URL } from '$env/static/private';

const emailSchema = z.object({
	email: z.string({ invalid_type_error: 'Invalid email', required_error: 'email is required' }).email()
});

export async function load(event) {
	const form = await superValidate(event, emailSchema);
	return { form };
}

export const actions = {
	async email(event) {
		const form = await superValidate(event, emailSchema);
		if (!form.valid) return fail(400, { form });

		const user = await db.getUniqueUserByEmail(form.data.email);
		if (!user) return setError(form, 'email', 'User with that email does not exist');

		const token = await db.setResetToken(user.userID);

		const link = APP_URL + `/auth/forgot/reset?userID=${user.userID}&token=${token}`;

		console.log(link);

		await sendResetEmail(form.data.email, link);
	}
};
