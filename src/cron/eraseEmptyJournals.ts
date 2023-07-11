import { eraseEmptyJournals } from "../controllers";

export default ['0 8 * * *', eraseEmptyJournals, 'eraseEmptyJournals']