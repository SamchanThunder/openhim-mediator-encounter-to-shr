# Client Registry Mediator
Description: Posts patient from OpenHIM to OpenCR

docker build -t crmediator .
docker run --network {NETWORK NAME} --name crmediator --rm -p 7060:7060 crmediator

docker build -t crmediator .
docker run -d \
  --network cht-net \
  --name crmediator \
  --rm \
  -p 7060:7060 \
  crmediator
