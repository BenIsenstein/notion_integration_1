import { syncContactsBetweenNotionAndGoogle } from "../controllers";

export default ['* * * * *', syncContactsBetweenNotionAndGoogle, 'syncContactsBetweenNotionAndGoogle']