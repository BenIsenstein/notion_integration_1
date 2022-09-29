gcloud functions deploy \
renew-gmail-push-notifications-watch \
--runtime=nodejs14 \
--trigger-http \
--env-vars-file=../env.yaml \
--entry-point=renew-gmail-push-notifications-watch \
--source=.. \
--service-account=cloud-tasks-client-account@notion-personal-integration-1.iam.gserviceaccount.com