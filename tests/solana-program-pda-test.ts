import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaProgramPdaTest } from "../target/types/solana_program_pda_test";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

describe("solana-program-pda-test", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaProgramPdaTest as Program<SolanaProgramPdaTest>;

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const wallet = new PublicKey("pkrQznmnts6q3vDfbDwuaj5JPqGmjiC6gJfx4xcAv5n");

  // Derive PDA
  const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('message'), wallet.toBuffer()],
    program.programId
  );

  console.log('Derived PDA:', messagePda.toString());
  console.log('Bump:', messageBump);

  it("Create Message Account", async () => {
    const message = "Hello World!";
    const transactionSignature = await program.methods
      .create(message)
      .accounts({
        messageAccount: messagePda,
      })
      .rpc({ commitment: "confirmed" });
    
    const messageAccount = program.account.messageAccount.fetch(
      messagePda,
      "confirmed"
    );

    console.log(JSON.stringify(messageAccount, null, 2));
    console.log(
      "Transaction Signature:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
    );
  });

  it("Update Message Account", async () => {
    const message = "Hello Solana!";
    const transactionSignature = await program.methods
      .update(message)
      .accounts({
        messageAccount: messagePda,
      })
      .rpc({ commitment: "confirmed" });

    const messageAccount = await program.account.messageAccount.fetch(
      messagePda,
      "confirmed"
    );

    console.log(JSON.stringify(messageAccount, null, 2));
    console.log(
      "Transaction Signature:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
    );
  });

  it("Delete Message Account", async () => {
    const transactionSignature = await program.methods
      .delete()
      .accounts({
        messageAccount: messagePda,
      })
      .rpc({ commitment: "confirmed" });

    const messageAccount = await program.account.messageAccount.fetchNullable(
      messagePda,
      "confirmed"
    );

    console.log("Expect Null:", JSON.stringify(messageAccount, null, 2));
    console.log(
      "Transaction Signature:",
      `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
    );
  });
});
