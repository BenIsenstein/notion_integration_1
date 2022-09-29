gcloud functions deploy \
process-desired-emails \
--runtime=nodejs14 \
--trigger-topic=new-email \
--env-vars-file=../env.yaml \
--memory=1024MB \
--entry-point=process-desired-emails \
--source=..