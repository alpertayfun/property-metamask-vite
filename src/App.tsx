import {
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    Section,
    Grid,
    Card,
    Avatar,
    Text,
    Inset,
    Separator,
    Theme,
    Link
} from "@radix-ui/themes";
import { useEffect, useState } from "react";
import {
    EIP6963EventNames,
    LOCAL_STORAGE_KEYS,
    isPreviouslyConnectedProvider
} from "./config";
import {
    CodeSandboxLogoIcon,
    DrawingPinIcon,
    RocketIcon,
} from "@radix-ui/react-icons";
import WalletButton from "./components/WalletButtons";

 const datas = [
    {id:0,name:"Modern Apartment in city",location:"California, United States",price:24.716,img:"./building1.jpg"},
    {id:1,name:"Modern Apartment in city",location:"New York, United States",price:29.792,img:"./building2.jpg"},
    {id:2,name:"Modern Apartment in city",location:"Los Angeles, United States",price:33.214,img:"./building1.jpg"},
    {id:3,name:"Modern Apartment in city",location:"Paris, France",price:33.214,img:"./building2.jpg"},
    {id:4,name:"Modern Apartment in city",location:"Sydney, Australia",price:30.325,img:"./building2.jpg"},
    {id:5,name:"Modern Apartment in city",location:"Dubai, UAE",price:21.293,img:"./building1.jpg"}
  ];


function App() {
    /**
     * @title injectedProviders
     * @dev State variable to store injected providers we have recieved from the extension as a map.
     */
    const [injectedProviders, setInjectedProviders] = useState<
        Map<string, EIP6963ProviderDetail>
    >(new Map());

    /**
     * @title connection
     * @dev State variable to store connection information.
     */
    const [connection, setConnection] = useState<{
        providerUUID: string;
        accounts: string[];
        chainId: number;
    } | null>(null);

    const [datasN, setdatasN] = useState(
        datas
    );

    useEffect(() => {
        /**
         * @title onAnnounceProvider
         * @dev Event listener for EIP-6963 announce provider event.
         * @param event The announce provider event.
         */
        const onAnnounceProvider = (event: EIP6963AnnounceProviderEvent) => {
            const { icon, rdns, uuid, name } = event.detail.info;

            if (!icon || !rdns || !uuid || !name) {
                console.error("invalid eip6963 provider info received!");
                return;
            }
            setInjectedProviders((prevProviders) => {
                const providers = new Map(prevProviders);
                providers.set(uuid, event.detail);
                return providers;
            });

            // This ensures that on page reload, the provider that was previously connected is automatically connected again.
            // It help prevent the need to manually reconnect again when the page reloads
            if (isPreviouslyConnectedProvider(rdns)) {
                handleConnectProvider(event.detail);
            }
        };

        // Add event listener for EIP-6963 announce provider event
        window.addEventListener(
            EIP6963EventNames.Announce,
            onAnnounceProvider as EventListener
        );

        // Dispatch the request for EIP-6963 provider
        window.dispatchEvent(new Event(EIP6963EventNames.Request));

        // Clean up by removing the event listener and resetting injected providers
        return () => {
            window.removeEventListener(
                EIP6963EventNames.Announce,
                onAnnounceProvider as EventListener
            );
            setInjectedProviders(new Map());
        };
    }, []);

    /**
     * @title handleConnectProvider
     * @dev Function to handle connecting to a provider.
     * @param selectedProviderDetails The selected provider details.
     */
    async function handleConnectProvider(
        selectedProviderDetails: EIP6963ProviderDetail
    ) {
        const { provider, info } = selectedProviderDetails;
        try {
            const accounts = (await provider.request({
                method: "eth_requestAccounts",
            })) as string[];
            const chainId = await provider.request({ method: "eth_chainId" });
            setConnection({
                providerUUID: info.uuid,
                accounts,
                chainId: Number(chainId),
            });
            localStorage.setItem(
                LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS,
                info.rdns
            );
        } catch (error) {
            console.error(error);
            throw new Error("Failed to connect to provider");
        }
    }

    /**
     * @title handleDisconnect
     * @dev Function to handle disconnecting from the provider.
     */
    const handleDisconnect = () => {
        setConnection(null);
        localStorage.removeItem(
            LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS
        );
    };


    const sendEth = () => {
        console.log("sendeth... ");
    }

    const connectedInjectectProvider =
        connection && injectedProviders.get(connection.providerUUID);

    return (
        <Theme>
        <Box>
            <Container>
                <Flex py="4" className="flex-col md:flex-row gap-4 p-4 md:p-0">
                    <Box className="w-full md:w-1/2">
                        {injectedProviders.size === 0 ? (
                            <div>
                                <Link href="https://metamask.io/es/download" >
                                    Download Metamask
                                </Link>
                            </div>
                        ) : (
                            <Flex className="gap-2 mb-4 flex-wrap">
                                {Array.from(injectedProviders).map(
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    ([_, { info, provider }]) => (
                                        <WalletButton
                                            key={info.uuid}
                                            handleConnect={
                                                handleConnectProvider
                                            }
                                            walletDetails={{ info, provider }}
                                            isConneted={
                                                connection?.providerUUID ===
                                                info.uuid
                                            }
                                        />
                                    )
                                )}
                            </Flex>
                        )}
                    </Box>
                    <Box className="w-full md:w-1/2">
                        <Flex align={"center"} className="gap-2">
                            <Heading as="h2"></Heading>
                        </Flex>
                        <Box className="w-full">
                            {connectedInjectectProvider?.info ? (
                                <Flex className="flex-col gap-2">
                                    <Flex className="gap-2">
                                        <span>Connected to:</span>
                                        {
                                            <Flex gap="1" align="center">
                                                <span>
                                                    {}
                                                    {
                                                        connectedInjectectProvider
                                                            .info.name
                                                    }
                                                </span>{" "}
                                                <img
                                                    className="w-5 h-5 rounded"
                                                    src={
                                                        connectedInjectectProvider
                                                            .info.icon
                                                    }
                                                    alt={
                                                        connectedInjectectProvider
                                                            .info.name
                                                    }
                                                />
                                            </Flex>
                                        }
                                    </Flex>
                                    <Flex className="gap-2">
                                        <span>Chain ID:</span>
                                        <Flex gap="1" align="center">
                                            <span>{connection?.chainId}</span>
                                        </Flex>
                                    </Flex>
                                    <Flex className="gap-2">
                                        <span>Accounts:</span>
                                        <span>
                                            {connection?.accounts.map(
                                                (account) => (
                                                    <span key={account}>
                                                        {account}
                                                    </span>
                                                )
                                            )}
                                        </span>
                                    </Flex>
                                    <Flex>
                                        <Button onClick={handleDisconnect}>
                                            Disconnect
                                        </Button>
                                    </Flex>
                                    <Flex></Flex>
                                </Flex>
                            ) : (
                                <Box></Box>
                            )}
                        </Box>
                    </Box>
                </Flex>
            </Container>


            <Flex wrap="wrap" gap="3" justify="center" p="3">
                {datasN.map((property) => (
                <Card key={property.id} style={{ width: 320 }}>
                    <Box
                    style={{
                        backgroundImage: `url(${property.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: 180,
                        borderRadius: 8,
                    }}
                    />
                    <Box pt="3" pb="2">
                    <Text weight="bold">Modern Apartment in city</Text>
                    <Separator my="3" size="4" />
                    <Text color="gray">{property.location}</Text>
                    <Separator my="3" size="4" />
                    <Button size="1" variant="soft" color="orange">{property.price}ETH</Button>
                    <Button size="1" variant="soft">
                        Visit
                    </Button>
                    </Box>
                </Card>
                ))}
            </Flex>

            {/* <Container>
            <Box>
            
            
            <Grid columns="3" rows="repeat(2, 260px)" width="auto">
                    {datasN.map(properties => (
                            <Card size="1">
                                    <Inset clip="padding-box" side="top" pb="current">
                                            <img
                                                src={properties.img}
                                                alt="Bold typography"
                                                style={{
                                                    display: "block",
                                                    objectFit: "cover",
                                                    height: 140,
                                                    backgroundColor: "var(--gray-5)",
                                                }}
                                            />
                                        </Inset>
                                        <Text as="div" size="2" weight="bold">
                                            {properties.name}
                                        </Text>
                                        <Text as="div" size="2" color="gray">
                                            {properties.city}
                                        </Text>    
                                        <Separator my="3" size="4" />
                                        <Flex gap="3" align="center">
                                            <Button size="1" variant="soft">{properties.price}ETH</Button>
                                            <Separator orientation="vertical" />
                                            <Button size="1" variant="soft">Visit</Button>
                                        </Flex> 
                                    
                            </Card>
                        ))}
                </Grid>
                </Box>
            </Container> */}
        </Box>
        </Theme>
    );
}

export default App;
