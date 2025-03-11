import {makeJsonFileFromDir, makeJsonFileFromFiles,} from "./makeJsonFileFromDir.ts";
import {getFromJson, Icon, renderHtml} from "./renderTemplate.ts";
import {emptyDir} from "@std/fs";

await emptyDir("build");

await makeJsonFileFromDir(["icons/azure/networking"], "build/azure.json");
await makeJsonFileFromDir(
  [
    "icons/kube/infrastructure_components/labeled",
    "icons/kube/resources/labeled",
  ],
  "build/kube.json",
);

await makeJsonFileFromFiles([
  "icons/logos/logos_aws.svg",
  "icons/logos/logos_aws-amplify.svg",
  "icons/logos/logos_aws-api-gateway.svg",
  "icons/logos/logos_aws-app-mesh.svg",
  "icons/logos/logos_aws-appflow.svg",
  "icons/logos/logos_aws-appsync.svg",
  "icons/logos/logos_aws-athena.svg",
  "icons/logos/logos_aws-aurora.svg",
  "icons/logos/logos_aws-backup.svg",
  "icons/logos/logos_aws-batch.svg",
  "icons/logos/logos_aws-certificate-manager.svg",
  "icons/logos/logos_aws-cloudformation.svg",
  "icons/logos/logos_aws-cloudfront.svg",
  "icons/logos/logos_aws-cloudsearch.svg",
  "icons/logos/logos_aws-cloudtrail.svg",
  "icons/logos/logos_aws-cloudwatch.svg",
  "icons/logos/logos_aws-codebuild.svg",
  "icons/logos/logos_aws-codecommit.svg",
  "icons/logos/logos_aws-codedeploy.svg",
  "icons/logos/logos_aws-codepipeline.svg",
  "icons/logos/logos_aws-codestar.svg",
  "icons/logos/logos_aws-cognito.svg",
  "icons/logos/logos_aws-config.svg",
  "icons/logos/logos_aws-documentdb.svg",
  "icons/logos/logos_aws-dynamodb.svg",
  "icons/logos/logos_aws-ec2.svg",
  "icons/logos/logos_aws-ecs.svg",
  "icons/logos/logos_aws-eks.svg",
  "icons/logos/logos_aws-elastic-beanstalk.svg",
  "icons/logos/logos_aws-elastic-cache.svg",
  "icons/logos/logos_aws-elasticache.svg",
  "icons/logos/logos_aws-elb.svg",
  "icons/logos/logos_aws-eventbridge.svg",
  "icons/logos/logos_aws-fargate.svg",
  "icons/logos/logos_aws-glacier.svg",
  "icons/logos/logos_aws-glue.svg",
  "icons/logos/logos_aws-iam.svg",
  "icons/logos/logos_aws-keyspaces.svg",
  "icons/logos/logos_aws-kinesis.svg",
  "icons/logos/logos_aws-kms.svg",
  "icons/logos/logos_aws-lake-formation.svg",
  "icons/logos/logos_aws-lambda.svg",
  "icons/logos/logos_aws-lightsail.svg",
  "icons/logos/logos_aws-mobilehub.svg",
  "icons/logos/logos_aws-mq.svg",
  "icons/logos/logos_aws-msk.svg",
  "icons/logos/logos_aws-neptune.svg",
  "icons/logos/logos_aws-open-search.svg",
  "icons/logos/logos_aws-opsworks.svg",
  "icons/logos/logos_aws-quicksight.svg",
  "icons/logos/logos_aws-rds.svg",
  "icons/logos/logos_aws-redshift.svg",
  "icons/logos/logos_aws-route53.svg",
  "icons/logos/logos_aws-s3.svg",
  "icons/logos/logos_aws-secrets-manager.svg",
  "icons/logos/logos_aws-ses.svg",
  "icons/logos/logos_aws-shield.svg",
  "icons/logos/logos_aws-sns.svg",
  "icons/logos/logos_aws-sqs.svg",
  "icons/logos/logos_aws-step-functions.svg",
  "icons/logos/logos_aws-systems-manager.svg",
  "icons/logos/logos_aws-timestream.svg",
  "icons/logos/logos_aws-vpc.svg",
  "icons/logos/logos_aws-waf.svg",
  "icons/logos/logos_aws-xray.svg",
], "build/logos.json");

const iconsData = new Map<string, Icon[]>();
for await (const file of Deno.readDir("build")) {
  iconsData.set(file.name, await getFromJson(`build/${file.name}`));
}
const html = await renderHtml(iconsData);
await Deno.writeTextFile("build/index.html", html);
