async function main() {
  await run('verify:verify', {
    address: '0x90769206c42Cda9f7420847B0162eEbEA09dD425',
    constructorArguments: [],
  });

  await run('verify:verify', {
    address: '0xbB9f617d962df673e182bA4F390140Dc2AC60179',
    constructorArguments: ['Blank NFT Studio Demo', 'BLANK'],
  });
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
