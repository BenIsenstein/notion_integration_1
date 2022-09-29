gcloud functions deploy \
contacts-add-whatsapp-link \
--runtime=nodejs14 \
--trigger-http \
--env-vars-file=../env.yaml \
--memory=256MB \
--entry-point=contacts-add-whatsapp-link \
--source=.. \
--no-allow-unauthenticated \
--service-account=cloud-functions-service-accoun@notion-personal-integration-1.iam.gserviceaccount.com