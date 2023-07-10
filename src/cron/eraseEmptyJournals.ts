import { eraseEmptyJournals } from "../controllers";

export default ['0 0 * * *', eraseEmptyJournals, 'eraseEmptyJournals']