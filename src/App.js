import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/Bank.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", bankName: "" });
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [bankName, setBankName] = useState("");

  const contractAddress = '0xEf9821BB7B9A279E49885dc7083Ac0A1196970Bb';
  const contractABI = abi.abi;




  const checkIfWalletConnected = async() => {
    try{
      if(window.ethereum){
        const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
        const account = accounts[0]
        setIsWalletConnected(true)
        setCustomerAddress(account)
        console.log("account succesfully connected : " , account)
      }else{
        setError("Please connect to the app metamask ")
        console.log("No wallet")
      }
    }catch(error){
      console.log(error)
    }
  }

  //get Bank Name

  const getBankName = async() => {
    try{
      if(window.ethereum){
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const bankContract= new ethers.Contract(contractAddress, contractABI, signer)

        let bankName = await bankContract.bankName()
        bankName = utils.parseBytes32String(bankName);
        setCurrentBankName(bankName)
      }else{
        setError("Please connect to the app metamask ")
        console.log("No wallet")
      }
  }catch(error){
    console.log(error)
  }
}

// set Bank Name

const changeBankName = async() => {
    try{
      if(window.ethereum){

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const bankContract= new ethers.Contract(contractAddress, contractABI, signer)

        let setBankName = await bankContract.setBankName(utils.formatBytes32String(bankName))
        console.log('Setting bank name ...')
        await setBankName.wait()
        console.log("Bank Name set successfully", setBankName.hash)
        await getBankName()
        
      }else{
        setError("Please connect to the app metamask ")
        console.log("No wallet")
      }
    }catch(error){
      console.log(error)
    }
}

//get bank owner address

const getBankOwner = async() =>{
  try{
    if(window.ethereum){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const bankContract= new ethers.Contract(contractAddress, contractABI, signer)

      let bankOwner = await bankContract.bankOwner()
      setBankOwnerAddress(bankOwner)

      const [account] = await window.ethereum.request({method:'eth_requestAccounts'});

      if(account.toLowerCase() === bankOwner.toLowerCase()){
        setIsBankerOwner(true)
      }
    }else{
      setError("Please connect to the app metamask ")
      console.log("No wallet")
    }
  }catch(error){
    console.log(error)
  }
}

// get customer Balance

const getCustomerBalance = async() =>{
    try{
        if(window.ethereum){
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner()
            const bankContract= new ethers.Contract(contractAddress, contractABI, signer)

            let customerBalance = await bankContract.getCustomerBalance()
            setCustomerTotalBalance(utils.formatEther(customerBalance))
            console.log('Retrieved Balance')
        }else{
          setError("Please connect to the app metamask ")
          console.log("No wallet")
        }
    }catch(error){
      console.log(error)
    }
}

// Deposit Money
const depositMoney = async() =>{
  try{
      if(window.ethereum){
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner()
          const bankContract= new ethers.Contract(contractAddress, contractABI, signer)

          console.log(depositAmount, "nain")
          let deposit = await bankContract.depositMoney({value: ethers.utils.parseEther(depositAmount)})
          console.log('Depositing Money ...')
          await deposit.wait()
          console.log('Money Deposited', deposit.hash)
          await getCustomerBalance()
          setDepositAmount('')
      }else{
        setError("Please connect to the app metamask ")
        console.log("No wallet")

      }
  }catch(error){
    console.log(error)
  }
}


// Withdraw Money

const WithdrawMoney = async() =>{
  try{
      if(window.ethereum){
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner()
          const bankContract= new ethers.Contract(contractAddress, contractABI, signer)

        const myAddress = await signer.getAddress()

          let withdraw = await bankContract.withdrawMoney(myAddress, ethers.utils.parseEther(withdrawAmount))
          console.log('Withrawing Money ...')
          await withdraw.wait()
          console.log('Money Withrawn', withdraw.hash)
          await getCustomerBalance()
          setWithdrawAmount('')
      }else{
        setError("Please connect to the app metamask ")
        console.log("No wallet")
      }
  }catch(error){
    console.log(error)
  }
}

useEffect(() => {
  checkIfWalletConnected();
  getBankName();
  getBankOwner();
  getCustomerBalance()
}, [isWalletConnected])


  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Bank Contract Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentBankName === "" && isBankerOwner ?
            <p>"Setup the name of your bank." </p> :
            <p className="text-3xl font-bold">{currentBankName}</p>
          }
        </div>
        <div className="mt-7 mb-9">
          <div className="form-style">
            <input
              type="text"
              className="input-style"
              // onChange={handleInputChange}
              onChange={(e)=>{
                console.log(e.target.value, "ploik")
                setDepositAmount(e.target.value)}}
              name="deposit"
              placeholder="0.0000 ETH"
              value={depositAmount}
            />
            <button
              className="btn-purple"
              onClick={depositMoney}>Deposit Money In ETH</button>
          </div>
        </div>
        <div className="mt-10 mb-10">
          <div className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={(e)=>setWithdrawAmount(e.target.value)}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={withdrawAmount}
            />
            <button
              className="btn-purple"
              onClick={WithdrawMoney}>
              Withdraw Money In ETH
            </button>
          </div>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Customer Balance: </span>{customerTotalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Bank Owner Address: </span>{bankOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{customerAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isBankerOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Bank Admin Panel</h2>
            <div className="p-10">
              <div className="form-style">
                <input
                  type="text"
                  className="input-style"
                  // onChange={handleInputChange}
                  onChange={(e)=>{
                    console.log(e.target.value, "ploik")
                    setBankName(e.target.value)}}
                  name="bankName"
                  placeholder="Enter a Name for Your Bank"
                  value={bankName}
                />
                <button
                  className="btn-grey"
                  onClick={changeBankName}>
                  Set Bank Name
                </button>
              </div>
            </div>
          </section>
        )
      }
    </main>
  
  );
}

export default App;
