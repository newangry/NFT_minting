"use client"
import { Button, Text, Flex, Image, Title, Center, Group, LoadingOverlay, Grid, Input, TextInput, Card, SimpleGrid } from "@mantine/core";
import useIsMobile from "./useIsMobile";
import { useEffect, useState } from "react";
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { supabaseClient } from "@/utils/app/supabase-client";
import { supabaseAdmin } from "@/utils/server/supabase-admin";

interface LandingProps {

}

const Landing: React.FC<LandingProps> = ({ }) => {
    const isMobile = useIsMobile(); // Default breakpoint is 768px
    const [isConnectedWallet, setIsConnectedWallet] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [solana, setSolana] = useState<any>(null);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [nftImages, setNftImages] = useState<any>([]);
    const [selectedNftIndex, setSlectedNftIndex] = useState<any>(-1);

    const openModal = () => modals.openConfirmModal({
        title: 'Please input the NFT name.',
        children: (
            <TextInput
                id="nft_name"
            />
        ),
        labels: { confirm: 'Upload', cancel: 'Cancel' },
        onCancel: () => console.log('Cancel'),
        onConfirm: () => uploadNFTImages(),
    });

    useEffect(() => {
        const solana = window?.solana;
        setIsConnectedWallet(
            solana ? true : false
        )
        setSolana(solana);
        getNftImages();
    }, [])

    const getNftImages = async () => {
        setIsLoading(true);
        const { data, error } = await supabaseAdmin
            .from('data').select("*");
        setNftImages(data);
        setIsLoading(false);
    }

    const connectWallet = async () => {
        if (solana.isGlow) {
            const response = await solana.connect();
            setWalletAddress(response.publicKey.toString());
            notifications.show({
                title: '',
                message: 'Connected wallet',
                color: "blue"
            })
        } else {
            notifications.show({
                title: '',
                message: 'Please install Glow wallet',
                color: "red"
            })
        }
    }

    const uploadNFTImages = async () => {
        setIsLoading(true);
        const nft_name: any = document.getElementById("nft_name");
        if (nft_name["value"] == "") {
            notifications.show({
                title: '',
                message: 'Please input NFT name.',
                color: "red"
            })
            return;
        }
        try {
            const res = await fetch("/api/upload_nft_images", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    wallet_address: walletAddress,
                    files: uploadedFiles,
                    nft_name: nft_name["value"]
                }),
            });
            notifications.show({
                title: 'Success',
                message: `Uploaded ${uploadedFiles.length} images successfully.`,
                color: "blue"
            })
            
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    }

    const showNFTImages = async (files: File[]) => {
        const promises: any = [];
        files.map((file: File) => {
            promises.push(imageFileToBase64(file))
        });
        const base64_files = await Promise.all(promises);
        setUploadedFiles(base64_files);
    }

    const imageFileToBase64 = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result); // Base64 string
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    const renderNftImage = (nft_data: any, index: number) => {
        
        if (!nft_data || !nft_data.meta_data) {
            console.warn("Invalid NFT data:", nft_data);
            return null;
        }

        const { meta_data } = nft_data;
        const images = Array.isArray(meta_data.images)
            ? meta_data.images
            : meta_data.image
                ? [{ image: meta_data.image }]
                : [];

        if (images.length === 0) {
            console.warn("No images found in meta_data:", meta_data);
            return null;
        }

        return (
            <Grid.Col span={isMobile ? 12 : 3} key={nft_data.id || Math.random()} sx={(theme) =>({cursor: 'pointer'})} >
                <Card shadow="sm" padding="lg" radius="md" withBorder
                    sx={(theme) =>({
                        border: index == selectedNftIndex ? '3px solid #0099ff !important':'0px solid black'
                    })}
                    onClick={() => {
                        setSlectedNftIndex(index)
                    }}
                >
                    <Card.Section>
                        <Image
                            src={`https://ipfs.io/ipfs/${images[0].image.split("//")[1]}`}
                            radius="sm"
                        />
                    </Card.Section>
                    <Text size="xl" color="black" mt={10}>
                        {meta_data.name || "Unnamed NFT"}
                    </Text>
                    {images.length > 1 && (
                        <Card.Section inheritPadding mt="sm" pb="md">
                            <SimpleGrid cols={isMobile ? 4 : 2} key={'first-image'}>
                                {images.map((image: any, key: number) => (
                                    <Flex
                                        gap={10}
                                        direction={'column'}
                                    >
                                        <Image
                                            src={`https://ipfs.io/ipfs/${image.image.split("//")[1]}`}
                                            key={key}
                                            radius="sm"
                                        />
                                        <Text>
                                            {image.view}
                                        </Text>
                                    </Flex>
                                ))}
                            </SimpleGrid>
                        </Card.Section>
                    )}
                </Card>
            </Grid.Col>
        );
    };

    return (

        <Flex
            direction={'column'}
            align={'center'}
            mt={50}
            mb={50}
            gap={30}
        >
            <Flex
                direction={'column'}
                gap={30}
                w={isMobile ? '90%' : '768px'}
                align={'center'}
            >
                <Title
                    style={{
                        fontSize: "50px",
                        fontFamily: "Arial, Helvetica, sans-serif",
                        background: "linear-gradient(to right, #f32170, #ff6b08, #cf23cf, #eedd44)",
                        WebkitTextFillColor: "transparent",
                        WebkitBackgroundClip: "text"
                    }}
                >NFT Minting</Title>
                <Center mt={30}>
                    {
                        walletAddress == "" ?
                            !isConnectedWallet ?
                                <Button
                                    color="red"
                                    onClick={() => {
                                        window.open("https://chromewebstore.google.com/detail/glow-solana-wallet-beta/ojbcfhjmpigfobfclfflafhblgemeidi");
                                    }}
                                >Install Glow Wallet</Button>
                                :
                                <Button
                                    color="green"
                                    onClick={() => {
                                        connectWallet()
                                    }}
                                >Connect Wallet</Button>
                            :
                            <Flex
                                gap={10}
                                direction={'column'}
                            >
                                <Text
                                    color="gray"
                                    size="20px"
                                >
                                    Wallet address
                                </Text>
                                <Text
                                    color="gray"
                                    size="20px"
                                >
                                    {walletAddress}
                                </Text>
                            </Flex>
                    }
                </Center>
                {
                    walletAddress != "" ?
                        <Dropzone
                            onDrop={(files) => {
                                showNFTImages(files);
                            }}
                            onReject={(files) => console.log('rejected files', files)}
                            maxSize={3 * 1024 ** 2}
                            accept={IMAGE_MIME_TYPE}
                        >
                            <Flex
                                justify="center" align={'center'}
                                gap="xl"
                            >
                                <Dropzone.Accept>
                                    <IconUpload
                                        size="3.2rem"
                                        stroke={1.5}
                                    />
                                </Dropzone.Accept>
                                <Dropzone.Reject>
                                    <IconX
                                        size="3.2rem"
                                        stroke={1.5}
                                    />
                                </Dropzone.Reject>
                                <Dropzone.Idle>
                                    <IconPhoto size="3.2rem" stroke={1.5} />
                                </Dropzone.Idle>
                                <div>
                                    <Text size="25px" inline>
                                        Drag images here or click to select files
                                    </Text>
                                </div>
                            </Flex>
                        </Dropzone> : <></>
                }
                <Flex
                    gap={20}
                    direction={'column'}
                >
                    <Grid grow gutter="sm">
                        {
                            uploadedFiles.map((item, index) =>
                                <Grid.Col span={4} key={index}>
                                    <img src={item} width={"100%"} key={index} />
                                </Grid.Col>
                            )
                        }
                    </Grid>
                    <Center>
                        {
                            walletAddress != "" ?
                                <Button
                                    color="blue"
                                    onClick={() => { openModal() }}
                                    disabled={uploadedFiles.length == 0 ? true : false}
                                    w={"200px"}
                                >
                                    Upload images
                                </Button> : <></>
                        }
                    </Center>
                </Flex>
                <LoadingOverlay visible={isLoading} overlayBlur={2} />
            </Flex>
            <Center mt={50}>
                <Text size={30} weight={'bold'}>
                    Uploaded NFT images
                </Text>
            </Center>
            <Center>
                <LoadingOverlay visible={isLoading} overlayBlur={2} />
                <Grid
                    w={'90%'}
                >
                    {
                        nftImages.length == 0 ?
                        <Center>
                            <Text>
                                No uploaded NFT images
                            </Text>
                        </Center>
                        :
                        nftImages.map((item: any, index: number) =>
                            renderNftImage(item, index)
                        )
                    }
                </Grid>
            </Center>
            <Center>
                <Button size="xl" disabled={selectedNftIndex > -1 ? false : true}>
                    Minting
                </Button>
            </Center>
        </Flex>
    )
}

export default Landing;