from flask import Blueprint, render_template, session, redirect, url_for, flash

user_rental_pages = Blueprint('user_rental_pages', __name__)

@user_rental_pages.route('/user/rental-applications')
def rental_applications():
    """Halaman Riwayat Pengajuan Sewa"""
    if 'user_id' not in session:
        flash('Anda harus login terlebih dahulu.', 'warning')
        return redirect(url_for('main.login'))
    
    return render_template('user_rental_applications.html')

@user_rental_pages.route('/user/rental-applications/<int:application_id>')
def rental_application_detail(application_id):
    """Halaman Detail Pengajuan Sewa"""
    if 'user_id' not in session:
        flash('Anda harus login terlebih dahulu.', 'warning')
        return redirect(url_for('main.login'))
    
    return render_template('user_rental_applications.html', application_id=application_id)

@user_rental_pages.route('/user/rental-transactions')
def rental_transactions():
    """Halaman Transaksi Sewa"""
    if 'user_id' not in session:
        flash('Anda harus login terlebih dahulu.', 'warning')
        return redirect(url_for('main.login'))
    
    return render_template('user_rental_transactions.html')

@user_rental_pages.route('/user/rental-transactions/<int:transaction_id>')
def rental_transaction_detail(transaction_id):
    """Halaman Detail Transaksi Sewa"""
    if 'user_id' not in session:
        flash('Anda harus login terlebih dahulu.', 'warning')
        return redirect(url_for('main.login'))
    
    return render_template('user_rental_transactions.html', transaction_id=transaction_id)
