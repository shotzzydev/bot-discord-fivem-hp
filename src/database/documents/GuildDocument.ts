interface GuildGlobal {
    channels?: {
        join?: string;
        leave?: string;
    },
    role?: string,
    messages?: {
        join?: string;
        leave?: string;
    },
    colors?: {
        join?: string;
        leave?: string;
    }
    image?: {
        join?: string;
        leave?: string;
    }
}

interface StatusFive {
    messagenid: string;
    messagenchannel: string;
    ipconnect: string;
    ipstatus: string;
    imagem?: string;
}

interface FormHp {
   channel: string;
}


interface Ticket {
    support_cat: string,
    fac_cat: string,
    donations_cat: string,
    report_cat: string,
    ombudsman_cat: string,
    donation_role: string,
    support_role: string,
    fac_role: string,
    report_role: string,
    ombudsman_role: string,
    transcripts: string,
}

interface Systems {
    logs?: string;
    verification?: string;
    suggestions?: string;
    backup?: string;
    very?: {
        channel: string;
        role: string;
    }
    icicialcodiguin?: string;
    registrocodiguin?: string;
    usadoscodiguin?: string;
    stats?: boolean;
}

export interface GuildDocument {
    welcome?: GuildGlobal,
    status?: StatusFive,
    ticket?: Ticket,
    systems?: Systems,
    FormHp?: FormHp,
}