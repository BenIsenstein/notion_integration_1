import { syncContactsBetweenNotionAndGoogle } from "../controllers";

export default ['*/2 * * * *', syncContactsBetweenNotionAndGoogle, 'syncContactsBetweenNotionAndGoogle']