curl 'https://api.jumper.exchange/pipeline/v1/advanced/routes' \
  --compressed \
  -X POST \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:146.0) Gecko/20100101 Firefox/146.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.5' \
  -H 'Accept-Encoding: gzip, deflate, br, zstd' \
  -H 'Referer: https://jumper.exchange/' \
  -H 'Content-Type: application/json' \
  -H 'x-lifi-widget: 3.38.0' \
  -H 'x-lifi-sdk: 3.14.1' \
  -H 'x-lifi-integrator: jumper.exchange' \
  -H 'Origin: https://jumper.exchange' \
  -H 'Sec-GPC: 1' \
  -H 'Connection: keep-alive' \
  -H 'Sec-Fetch-Dest: empty' \
  -H 'Sec-Fetch-Mode: cors' \
  -H 'Sec-Fetch-Site: same-site' \
  -H 'Priority: u=4' \
  -H 'Pragma: no-cache' \
  -H 'Cache-Control: no-cache' \
  -H 'TE: trailers' \
  --data-raw '{"fromAddress":"0x405F34617e9867F5FA3C5467B0E07D9ee85F1678","fromAmount":"100000000000000000","fromChainId":1,"fromTokenAddress":"0x0000000000000000000000000000000000000000","toChainId":42161,"toTokenAddress":"0xaf88d065e77c8cC2239327C5EDb3A432268e5831","options":{"integrator":"jumper.exchange","order":"CHEAPEST","maxPriceImpact":0.4,"jitoBundle":true,"allowSwitchChain":true,"executionType":"all"}}'



  https://api.jumper.exchange/pipeline/v1/wallets/0x405F34617e9867F5FA3C5467B0E07D9ee85F1678/balances?extended=true

  


  curl --location 'https://api.jumper.exchange/pipeline/v1/wallets/0xc43f9c2f2b61f3dec87e6c3f0f33c150a6526ace/balances?extended=true' \
--header 'Referer: https://jumper.exchange/'


https://docs.li.fi/sdk/configure-sdk