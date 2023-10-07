import { syncContactsBetweenNotionAndGoogle } from "../controllers";

export default ['*/5 * * * *', syncContactsBetweenNotionAndGoogle, 'syncContactsBetweenNotionAndGoogle']