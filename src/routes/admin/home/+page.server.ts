import db from '$lib/server/db';
import { fail } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export async function load(event) {
if (!event.locals.user) throw redirect(302, '/login');
	if (!event.locals.user.admin) throw redirect(302, '/home');

	return {
		// get all reports
		reports: await db.report.findMany()
	};
}

export const actions = {
	// this runs when the delete button for a report is clicked
	async delete({ url }) {
		const reporterID = url.searchParams.get('reporterID');
		const culpritID = url.searchParams.get('culpritID');

		if (!reporterID || !culpritID) return fail(400);

		try {
			await db.report.delete({
				where: {
					reporterID_culpritID: {
						reporterID,
						culpritID
					}
				}
			});
		} catch (error) {
			return fail(500, { error });
		}
		return { status: 200 };
	}
};
