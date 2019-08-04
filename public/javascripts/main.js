function showFDg(op,fDg) {
    console.log(op);
    fDg.innerText = op[0];
    fDg.style.display = 'block';
    setTimeout(hideFDg, op[1]*1000,fDg)
}

function hideFDg(fDg) {
    fDg.style.display = 'none';
}