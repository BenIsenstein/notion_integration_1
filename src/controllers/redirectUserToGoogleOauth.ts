import { createConsentPageUrl } from "../services"

export const redirectUserToGoogleOauth = (req, res) => {
    res.redirect(createConsentPageUrl())
}