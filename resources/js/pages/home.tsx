import GuestLayout from "@/layouts/guest-layout";

export default function Welcome() {
    return (
        <>
            <p>Your welcome page</p>
        </>
    );
}

Welcome.layout = (page: React.ReactNode) => <GuestLayout>{page}</GuestLayout>;